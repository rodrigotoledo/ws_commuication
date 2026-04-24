class TransmissionChannel < ApplicationCable::Channel
  def subscribed
    logger.info "✅ TransmissionChannel#subscribed called with params: #{params.inspect}"
    @room_id = params[:room_id]
    stream_from "room_#{@room_id}"
  end

  def receive(data)
    room = Room.find(@room_id)
    sender = User.find_by!(email: data["sender_email"])
    receiver = User.find_by!(email: data["receiver_email"])
    content = data["content"]

    room.messages.create!(sender: sender, receiver: receiver, content: content)

    
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
