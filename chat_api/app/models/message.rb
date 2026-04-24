class Message < ApplicationRecord
  belongs_to :room
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'

  after_create :broadcast_message

  def payload
    {
      id: id,
      content: content,
      created_at: created_at,
      sender: { email: sender.email },
      receiver: { email: receiver.email }
    }
  end

  private
  def broadcast_message
    ActionCable.server.broadcast("room_#{room.id}", {
      action: "new_message",
      message: payload
    })
  end
end
