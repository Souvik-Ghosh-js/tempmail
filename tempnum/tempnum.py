import temporary_number

# number = temporary_number.get_number()
# print(number)
# number2 = temporary_number.get_number(country="Finland")
# print(number2)

messages = temporary_number.get_messages('+447893932949')
for message in messages:
  print(f"{message.time} | From {message.frm}")
  print(message.content)