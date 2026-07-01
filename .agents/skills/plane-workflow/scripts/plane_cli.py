import sys
import json
import requests
import argparse

API_KEY = "plane_api_af971fdc54404723aed105c6ad14f07a"
WORKSPACE = "capsula"
PROJECT_ID = "6308445e-8b0b-4eee-bf27-07c14b2a6331"
BASE_URL = f"https://api.plane.so/api/v1/workspaces/{WORKSPACE}/projects/{PROJECT_ID}"
HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def get_states():
    resp = requests.get(f"{BASE_URL}/states/", headers=HEADERS)
    resp.raise_for_status()
    return {s['name'].lower(): s['id'] for s in resp.json().get('results', [])}

def get_issue_uuid(identifier):
    if "-" in identifier and len(identifier) > 20:
        return identifier
        
    seq_id = identifier.replace("CAPSU-", "")
    
    url = f"{BASE_URL}/issues/"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    issues = resp.json().get('results', [])
    for i in issues:
        if str(i.get('sequence_id')) == seq_id:
            return i['id']
    print(f"Error: Issue with sequence {identifier} not found.")
    sys.exit(1)

def list_issues(state=None):
    url = f"{BASE_URL}/issues/"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    issues = resp.json().get('results', [])
    
    states_inv = {v: k for k, v in get_states().items()}
    
    for i in issues:
        s_name = states_inv.get(i.get('state_id'), 'unknown')
        if state and s_name.lower() != state.lower():
            continue
        print(f"CAPSU-{i['sequence_id']} | State: {s_name.upper()} | {i['name']}")

def update_issue_state(identifier, state_name):
    issue_id = get_issue_uuid(identifier)
    states = get_states()
    state_id = states.get(state_name.lower())
    if not state_id:
        print(f"Error: State '{state_name}' not found. Available: {list(states.keys())}")
        return
        
    url = f"{BASE_URL}/issues/{issue_id}/"
    resp = requests.patch(url, headers=HEADERS, json={"state_id": state_id})
    resp.raise_for_status()
    print(f"Issue CAPSU-{identifier.replace('CAPSU-', '')} state updated to '{state_name}'.")

def add_comment(identifier, comment):
    issue_id = get_issue_uuid(identifier)
    url = f"{BASE_URL}/issues/{issue_id}/comments/"
    resp = requests.post(url, headers=HEADERS, json={"comment_html": f"<p>{comment}</p>"})
    if resp.status_code in (200, 201):
        print(f"Comment added to issue CAPSU-{identifier.replace('CAPSU-', '')}.")
    else:
        print(f"Failed: {resp.text}")

def get_issue(identifier):
    issue_id = get_issue_uuid(identifier)
    url = f"{BASE_URL}/issues/{issue_id}/"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    i = resp.json()
    states_inv = {v: k for k, v in get_states().items()}
    s_name = states_inv.get(i.get('state_id'), 'unknown')
    
    print(f"ID: CAPSU-{i['sequence_id']}")
    print(f"Title: {i['name']}")
    print(f"State: {s_name.upper()}")
    print(f"Priority: {i.get('priority', 'none')}")
    print("Description:")
    print(i.get('description_html', ''))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Plane CLI for Project BackOffice-Multitenant")
    subparsers = parser.add_subparsers(dest="command")

    list_p = subparsers.add_parser("list")
    list_p.add_argument("--state", help="Filter by state name")

    get_p = subparsers.add_parser("get")
    get_p.add_argument("identifier", help="Issue ID like '1' or 'CAPSU-1'")

    update_p = subparsers.add_parser("update-state")
    update_p.add_argument("identifier")
    update_p.add_argument("state_name")

    comment_p = subparsers.add_parser("comment")
    comment_p.add_argument("identifier")
    comment_p.add_argument("text")

    args = parser.parse_args()

    if args.command == "list":
        list_issues(args.state)
    elif args.command == "get":
        get_issue(args.identifier)
    elif args.command == "update-state":
        update_issue_state(args.identifier, args.state_name)
    elif args.command == "comment":
        add_comment(args.identifier, args.text)
    else:
        parser.print_help()
