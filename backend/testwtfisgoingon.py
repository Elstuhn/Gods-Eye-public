from notion_client import Client
from pprint import pprint

notion_token = "secret_ebDPOE7JGd4uHCliPvtN436cs05wS1fB3bOeEVNrr5L" #updated key
notion_page_id = "fcd6d9c7acf94546880e63ba0d7c0f2c" #Mo's database id

def write_text(client, page_id, text, type):
    client.blocks.children.append(
        block_id=page_id,
        children=[
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": text
                            }
                        }
                    ]
                }
            }
        ]
    )

def main():
    client = Client(auth=notion_token)

    write_text(client, notion_page_id, 'Hello World!', 'to_do')

if __name__ == '__main__':
    main()
