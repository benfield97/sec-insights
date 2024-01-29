import os

# Get the directory that the current script is in
current_directory = os.path.dirname(os.path.abspath(__file__))

# Get the parent directory
parent_directory = os.path.dirname(current_directory)

print(parent_directory)

# export PYTHONPATH="${PYTHONPATH}:/Users/user/Desktop/coding/WIP/sec-insights/"
# poetry run python scripts/seed_db.py

# docker 
# export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"


# poetry 
# export PATH="$HOME/.local/bin:$PATH"
# source ~/.zshrc

# running with chat repl

#poetry run python scripts/upsert_document.py URL
#copy db ID

#make chat
# pick_docs
# select_id id of docs
#finish
#create


# test river URL https://drive.google.com/uc?export=download&id=12RbUiWXL2W0BogrhgilW7zdtR3W9P

