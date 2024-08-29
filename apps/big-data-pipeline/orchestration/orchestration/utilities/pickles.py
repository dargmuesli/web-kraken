import os


def get_pickle_path(name: str):
    pickle_path = os.path.normpath(os.path.join(os.getcwd(), "..", "..", "pickles", f"pickle_{name}.csv"))
    return pickle_path
