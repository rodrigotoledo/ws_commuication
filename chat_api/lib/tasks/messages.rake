namespace :messages do
  desc "Generate a test message"
  task generate: :environment do
    room = Room.first
    3.times do
      users = [User.first, User.last].shuffle
      sender = users.shift
      receiver = users.shift
      content = Faker::Lorem.paragraph
      room.messages.create!(sender: sender, receiver: receiver, content: content)
    end
  end
end
