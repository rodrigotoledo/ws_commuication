class MessagesController < ApplicationController
  def index
    room = Room.find(params[:room_id])

    render json: {
      messages: room.messages.includes(:sender, :receiver).order(:created_at).map(&:payload)
    }
  end
end
