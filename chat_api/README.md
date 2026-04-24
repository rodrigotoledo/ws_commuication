# Chat API – WebSocket Usage

This app provides real-time chat functionality using the WebSocket protocol. Below are instructions to connect via WebSocket and send a message to the first room, specifying sender and receiver.

## WebSocket Endpoint

```
ws://localhost:3000/cable
```

## Example: Send a Message to the First Room

### 1. Connect to WebSocket

You can use [websocat](https://github.com/vi/websocat), browser dev tools, or any WebSocket client.

**Example using websocat:**

```bash
websocat ws://localhost:3000/cable
```

### 2. Subscribe to the First Room Channel

Send a subscription message (replace `TransmissionChannel` and `room_id` as needed):

```json
{
  "command": "subscribe",
  "identifier": "{\"channel\":\"TransmissionChannel\",\"room_id\":1}"
}
```

### 3. Send a Message

After subscribing, send a message with sender and receiver emails:

```json
{
  "command": "message",
  "identifier": "{\"channel\":\"TransmissionChannel\",\"room_id\":1}",
  "data": "{\"sender_email\":\"sender@example.com\",\"receiver_email\":\"receiver@example.com\",\"content\":\"Hello from sender to receiver!\"}"
}
```

- `room_id`: ID of the room (use `1` for the first room)
- `sender_email`: Email of the sender user
- `receiver_email`: Email of the receiver user
- `content`: The message text

### 4. Example Workflow

1. **Connect:**  
   `websocat ws://localhost:3000/cable`

2. **Subscribe:**  
   Paste the subscribe JSON above.

3. **Send Message:**  
   Paste the message JSON above.

### 5. Response

You will receive broadcast messages in the WebSocket client as new messages are sent.

## Notes

- Ensure your Rails server is running and Action Cable is configured.
- Replace IDs with actual values from your database if different.
- The channel name (`RoomChannel`) and parameters may vary depending on your implementation.

## Useful Links

- [Action Cable Overview (Rails Guides)](https://guides.rubyonrails.org/action_cable_overview.html)
- [websocat](https://github.com/vi/websocat)
