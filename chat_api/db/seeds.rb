3.times do
  Room.create(name: "Room #{rand(100)}")
end

User.create(email: 'sender@example.com')
User.create(email: 'receiver@example.com')