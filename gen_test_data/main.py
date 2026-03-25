import random
from faker import Faker
import unicodedata

fake = Faker("es_ES")  # Spanish names for Argentina

locations = [
    "Villa Constitución, Santa Fe, Argentina",
    "Empalme Villa Constitución, Santa Fe, Argentina",
    "San Nicolás de los Arroyos, Buenos Aires, Argentina",
    "Rosario, Santa Fe, Argentina",
    "Arroyo Seco, Santa Fe, Argentina",
    "La Vanguardia, Santa Fe, Argentina",
    "Theobald, Santa Fe, Argentina",
    "Soldini, Santa Fe, Argentina",
    "Funes, Santa Fe, Argentina",
    "Pérez, Santa Fe, Argentina",
    "Granadero Baigorria, Santa Fe, Argentina",
    "Santa Teresa, Santa Fe, Argentina",
    "Uranga, Santa Fe, Argentina",
    "Pergamino, Buenos Aires, Argentina",
    "Ramallo, Buenos Aires, Argentina",
]


special_needs_list = [
    "Requires wheelchair assistance",
    "Visual impairment",
    "Hearing impairment",
    "Autism spectrum disorder",
    "Down syndrome",
]


shirt_sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
]


def generate_shirt_size():
    # Normal distribution around M/L (index 2-3)
    size_index = int(random.gauss(2.5, 1.0))  # mean 2.5 (between M and L), std dev 1
    size_index = max(0, min(5, size_index))  # clamp to 0-5
    return shirt_sizes[size_index]


def generate_phone():
    return f"54_9_{random.randint(1000000000, 9999999999)}"


def generate_id():
    return f"{random.randint(20000000, 45000000)}"


def generate_users(N):
    users = []
    managers = []
    for i in range(N):
        name = fake.first_name()
        surname = fake.last_name()
        phone = generate_phone()
        # email = fake.email()
        email_name = (
            f"{name.lower().replace(' ', '_')}.{surname.lower().replace(' ', '_')}"
        )
        # remove accents, diacritics and special characters from email
        email_name = (
            unicodedata.normalize("NFD", email_name)
            .encode("ascii", "ignore")
            .decode("utf-8")
        )
        email = f"{email_name}@example.com"
        emergency_contact_name = f"{fake.first_name()} {fake.last_name()}"
        emergency_contact_phone = generate_phone()
        sex = random.choice(["M", "F"])
        date_of_birth = (
            fake.date_of_birth(minimum_age=10, maximum_age=80).isoformat()
            + "T03:00:00.000Z"
        )
        clothing_shirt_size = generate_shirt_size()

        # location
        if random.random() < 0.05:  # 5% chance
            location = "temporary_location"
            location_temp = f"{fake.city()} {fake.state()}"
        else:
            location = random.choice(locations)
            location_temp = None

        location_address = f"{fake.street_name()} {random.randint(100, 9999)}"

        # special needs
        if random.random() < 0.005:  # 0.5% chance
            special_needs = random.choice(special_needs_list)
            discount_percentage = 100
        else:
            special_needs = None
            discount_percentage = 0

        # role
        if random.random() < 0.1:  # 10% managers
            role = "athletes_manager"
        else:
            role = "athlete"

        # training_team_id
        if random.random() < 0.3:  # 30% null
            training_team_id = None
            if random.random() < 0.1:  # 10% of nulls get temp
                training_team_temp = f"Equipo {fake.word().capitalize()}"
            else:
                training_team_temp = None
        else:
            training_team_id = random.randint(1, 10)
            training_team_temp = None

        # id
        user_id = generate_id()

        user = {
            "id": user_id,
            "name": name,
            "surname": surname,
            "phone": phone,
            "email": email,
            "emergency_contact_name": emergency_contact_name,
            "emergency_contact_phone": emergency_contact_phone,
            "sex": sex,
            "date_of_birth": date_of_birth,
            "clothing_shirt_size": clothing_shirt_size,
            "location": location,
            "location_temp": location_temp,
            "location_address": location_address,
            "special_needs": special_needs,
            "discount_percentage": discount_percentage,
            "manager_id": None,  # will assign later
            "training_team_id": training_team_id,
            "training_team_temp": training_team_temp,
            "profile_photo_id": None,
            "banned": 0,
            "ban_reason": None,
            "role": role,
        }

        users.append(user)
        if role == "athletes_manager":
            managers.append(user_id)

    # assign managers to some athletes
    athletes = [u for u in users if u["role"] == "athlete"]
    if managers:
        num_to_assign = max(1, len(athletes) // 10)  # at least 1 if possible
        to_assign = random.sample(athletes, min(num_to_assign, len(athletes)))
        for athlete in to_assign:
            athlete["manager_id"] = random.choice(managers)

    return users


def generate_sql(users):
    values = []
    for user in users:
        val = f"""(
    '{user["id"]}',
    '{user["name"]}',
    '{user["surname"]}',
    '{user["phone"]}',
    '{user["email"]}',
    '{user["emergency_contact_name"]}',
    '{user["emergency_contact_phone"]}',
    '{user["sex"]}',
    '{user["date_of_birth"]}',
    '{user["clothing_shirt_size"]}',
    {f"'{user['location']}'" if user["location"] else "NULL"},
    {f"'{user['location_temp']}'" if user["location_temp"] else "NULL"},
    '{user["location_address"]}',
    {f"'{user['special_needs']}'" if user["special_needs"] else "NULL"},
    {user["discount_percentage"]},
    {f"'{user['manager_id']}'" if user["manager_id"] else "NULL"},
    {user["training_team_id"] if user["training_team_id"] else "NULL"},
    {f"'{user['training_team_temp']}'" if user["training_team_temp"] else "NULL"},
    NULL,
    0,
    NULL,
    '{user["role"]}'
  )"""
        values.append(val)

    sql = f"""INSERT INTO
users (
    id,
    name,
    surname,
    phone,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    sex,
    date_of_birth,
    clothing_shirt_size,
    location,
    location_temp,
    location_address,
    special_needs,
    discount_percentage,
    manager_id,
    training_team_id,
    training_team_temp,
    profile_photo_id,
    banned,
    ban_reason,
    role
  )
VALUES
{",".join(values)};"""
    return sql


if __name__ == "__main__":
    N = 250  # Change this number to generate more or fewer users
    users = generate_users(N)
    sql = generate_sql(users)
    with open("last.txt", "r") as fp:
        last_sql = int(fp.read().strip())
    with open(f"insert_users_{last_sql + 1}.sql", "w") as f:
        f.write(sql)
    with open("last.txt", "w") as fp:
        fp.write(str(last_sql + 1))
    print(f"Generated insert_users_{last_sql + 1}.sql with {N} users.")
