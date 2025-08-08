import csv

import requests


def fetch_public_suffix_list():
    url = "https://publicsuffix.org/list/public_suffix_list.dat"
    response = requests.get(url)
    response.raise_for_status()
    lines = response.text.splitlines()

    # Filter out comments and empty lines
    suffixes = [
        line.strip().lower()
        for line in lines
        if line and not line.startswith("//")
    ]
    return suffixes


def save_to_csv(
        suffixes,
        filename="./app/static/assets/data/public_suffix_list.csv"):
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Suffix"])  # Header
        for suffix in suffixes:
            writer.writerow([suffix])


if __name__ == "__main__":
    suffixes = fetch_public_suffix_list()
    save_to_csv(suffixes)
    print(f"Saved {len(suffixes)} public suffixes to 'public_suffix_list.csv'")
