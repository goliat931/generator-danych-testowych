# Odczyt pliku z kodowaniem CP852
with open('./static/plewibnra.txt', 'r', encoding='cp852') as f:
    content = f.read()

# Zapis do UTF-8
with open('./static/plewibnra_utf8.txt', 'w', encoding='utf-8') as f:
    f.write(content)