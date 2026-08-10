"""Railway GraphQL helper.

The CLI has no command for a service's root directory or cron schedule, so this
talks to the same API the dashboard uses. The token is read straight out of the
CLI's own config and never printed: every failure path prints the response body
only after stripping anything token-shaped.
"""
import json
import sys
import urllib.request
import urllib.error
import os

CONFIG = os.path.expanduser("~/.railway/config.json")
ENDPOINT = "https://backboard.railway.com/graphql/v2"

PROJECT_ID = "761af324-f29b-498a-922c-b6c4e34f3ccd"
ENVIRONMENT_ID = "4bbcab16-e50e-4078-88c0-5c9ed830cab6"

_token = json.load(open(CONFIG))["user"]["token"]


def _scrub(text):
    return text.replace(_token, "<token redacted>") if _token else text


def gql(query, variables=None):
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={
            "Authorization": f"Bearer {_token}",
            "Content-Type": "application/json",
            # Cloudflare in front of the API rejects requests with no browser-ish
            # signature (error 1010), so mirror what the CLI itself sends.
            "User-Agent": "railwayapp/4.0.0",
        },
    )
    try:
        data = json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as exc:
        sys.exit(f"HTTP {exc.code}: {_scrub(exc.read().decode('utf-8', 'ignore'))[:400]}")
    if data.get("errors"):
        sys.exit("GraphQL error: " + _scrub(json.dumps(data["errors"]))[:400])
    return data["data"]


def services():
    q = """
    query($id: String!) {
      project(id: $id) {
        name
        services { edges { node { id name } } }
      }
    }
    """
    d = gql(q, {"id": PROJECT_ID})
    return {e["node"]["name"]: e["node"]["id"] for e in d["project"]["services"]["edges"]}


def instance(service_id):
    q = """
    query($sid: String!, $eid: String!) {
      serviceInstance(serviceId: $sid, environmentId: $eid) {
        id rootDirectory cronSchedule startCommand buildCommand builder
        source { repo }
      }
    }
    """
    return gql(q, {"sid": service_id, "eid": ENVIRONMENT_ID})["serviceInstance"]


def update(service_id, **fields):
    q = """
    mutation($sid: String!, $eid: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(serviceId: $sid, environmentId: $eid, input: $input)
    }
    """
    return gql(q, {"sid": service_id, "eid": ENVIRONMENT_ID, "input": fields})


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    svc = services()
    if cmd == "list":
        for name, sid in svc.items():
            print(f"  {name}: {sid}")
    elif cmd == "show":
        sid = svc[sys.argv[2]]
        for k, v in (instance(sid) or {}).items():
            print(f"  {k}: {v}")
    elif cmd == "set":
        sid = svc[sys.argv[2]]
        fields = dict(p.split("=", 1) for p in sys.argv[3:])
        print(" ", update(sid, **fields))
