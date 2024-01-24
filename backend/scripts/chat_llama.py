# Import necessary modules
import cmd
import requests
from sseclient import SSEClient
import json
import random
from urllib.parse import quote

# Function to handle Server-Sent Events (SSE) with the requests library
def sse_with_requests(url, headers) -> requests.Response:
    """Get a streaming response for the given event feed using requests."""
    return requests.get(url, stream=True, headers=headers)

# Class for handling document picking commands in a command-line interface
class DocumentPickerCmd(cmd.Cmd):
    prompt = "(Pick📄) "  # Command prompt text

    # Initialize the command handler with a base URL for API requests
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.documents = None  # To store fetched documents
        self.selected_documents = []  # To store user-selected documents

    # Command to fetch documents from the server
    def do_fetch(self, args):
        "Get 5 documents: fetch"
        response = requests.get(f"{self.base_url}/api/document/")
        if response.status_code == 200:
            # Randomly select 5 documents from the fetched list
            self.documents = random.choices(response.json(), k=5)
            # Display the URLs of the selected documents
            for idx, doc in enumerate(self.documents):
                print(f"[{idx}]: {doc['url']}")
        else:
            # Display an error message if the request fails
            print(f"Error: {response.text}")

    # Command to select a document by its index in the fetched list
    def do_select(self, document_idx):
        "Select a document by its index: select <Index>"
        if self.documents is None:
            print("Please fetch documents first: fetch")
            return
        try:
            idx = int(document_idx)
            if idx < len(self.documents):
                self.selected_documents.append(self.documents[idx])
                print(f"Selected document: {self.documents[idx]['url']}")
            else:
                print("Invalid index. Use the GET command to view available documents.")
        except ValueError:
            print("Invalid index. Please enter a number.")

    # Command to select a document by its ID
    def do_select_id(self, document_id):
        "Select a document by its ID"
        if not document_id:
            print("Please enter a valid document ID")
        else:
            self.selected_documents.append({"id": document_id})
            print(f"Selected document ID {document_id}")

    # Command to finish the document selection process
    def do_finish(self, args):
        "Finish the document selection process: FINISH"
        if len(self.selected_documents) > 0:
            return True
        else:
            print("No documents selected. Use the SELECT command to select documents.")

    # Command to quit the document picker
    def do_quit(self, args):
        "Quits the program."
        print("Quitting document picker.")
        raise SystemExit

# Class for handling conversation-related commands in the CLI
class ConversationCmd(cmd.Cmd):
    prompt = "(Chat🦙) "  # Command prompt text

    # Initialize the command handler with a base URL for API requests
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.conversation_id = None  # To store the current conversation ID
        self.document_ids = []  # To store IDs of selected documents

    # Command to pick documents for a new conversation
    def do_pick_docs(self, args):
        "Pick documents for the new conversation: pick_docs"
        picker = DocumentPickerCmd(self.base_url)
        try:
            picker.cmdloop()
        except KeyboardInterrupt:
            picker.do_quit("")
        except Exception as e:
            print(e)
            picker.do_quit("")
        self.document_ids = [doc["id"] for doc in picker.selected_documents]

    # Command to create a new conversation
    def do_create(self, args):
        "Create a new conversation: CREATE"
        req_body = {"document_ids": self.document_ids}
        response = requests.post(f"{self.base_url}/api/conversation/", json=req_body)
        if response.status_code == 200:
            self.conversation_id = response.json()["id"]
            print(f"Created conversation with ID {self.conversation_id}")
        else:
            print(f"Error: {response.text}")

    # Command to get details of the current conversation
    def do_detail(self, args):
        "Get the details of the current conversation: DETAIL"
        if not self.conversation_id:
            print("No active conversation. Use CREATE to start a new conversation.")
            return
        response = requests.get(
            f"{self.base_url}/api/conversation/{self.conversation_id}"
        )
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=4))
        else:
            print(f"Error: {response.text}")

    # Command to delete the current conversation
    def do_delete(self, args):
        "Delete the current conversation: DELETE"
        if not self.conversation_id:
            print("No active conversation to delete.")
            return
        response = requests.delete(
            f"{self.base_url}/api/conversation/{self.conversation_id}"
        )
        if response.status_code == 204:
            print(f"Deleted conversation with ID {self.conversation_id}")
            self.conversation_id = None
        else:
            print(f"Error: {response.text}")

    # Command to send a message to the current conversation
    def do_message(self, message):
        "Send a user message to the current conversation and get back the AI's response: MESSAGE <Your message>"
        if not self.conversation_id:
            print("No active conversation. Use CREATE to start a new conversation.")
            return
        message = quote(message.strip())  # URI encode the message
        url = f"{self.base_url}/api/conversation/{self.conversation_id}/message?user_message={message}"
        headers = {"Accept": "text/event-stream"}
        response = sse_with_requests(url, headers)
        messages = SSEClient(response).events()
        message_idx = 0
        final_message = None
        for msg in messages:
            print(f"\n\n=== Message {message_idx} ===")
            msg_json = json.loads(msg.data)
            print(msg_json)
            final_message = msg_json.get("content")
            message_idx += 1

        if final_message is not None:
            print(f"\n\n====== Final Message ======")
            print(final_message)

    # Command to quit the conversation handler
    def do_quit(self, args):
        "Quits the program."
        print("Quitting.")
        raise SystemExit

# Main execution block
if __name__ == "__main__":
    import argparse

    # Set up argument parsing for the command-line interface
    parser = argparse.ArgumentParser(description="Start the chat terminal.")
    parser.add_argument(
        "--base_url",
        type=str,
        default="http://localhost:8000",
        help="an optional base url for the API endpoints",
    )
    args = parser.parse_args()

    # Create and start the conversation command handler
    cmd = ConversationCmd(args.base_url)
    try:
        cmd.cmdloop()
    except KeyboardInterrupt:
        cmd.do_quit("")
    except Exception as e:
        print(e)
        cmd.do_quit("")
