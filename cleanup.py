import os
import shutil
import argparse

# Common waste folders for Python + Node.js projects
WASTE_FOLDERS = [
    "__pycache__", ".pytest_cache", ".mypy_cache", ".ipynb_checkpoints",
    ".venv", "venv", "env",
    "node_modules", "dist", "build", "out",
    ".next", ".nuxt", ".parcel-cache", ".vite",
    "target"
]

# Common junk files
WASTE_FILES = [
    ".DS_Store", "Thumbs.db"
]

def find_junk(root="."):
    found = []

    for dirpath, dirnames, filenames in os.walk(root):
        for dirname in list(dirnames):
            if dirname in WASTE_FOLDERS:
                full_path = os.path.join(dirpath, dirname)
                found.append(full_path)
        for filename in filenames:
            if filename in WASTE_FILES or filename.endswith(".log"):
                full_path = os.path.join(dirpath, filename)
                found.append(full_path)
    return found


def delete_junk(junk_items):
    for item in junk_items:
        if os.path.isdir(item):
            shutil.rmtree(item, ignore_errors=True)
        elif os.path.isfile(item):
            os.remove(item)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean up junk files/folders in a project.")
    parser.add_argument("--dry-run", action="store_true", help="Only list junk files/folders without deleting them")
    parser.add_argument("--delete", action="store_true", help="Actually delete junk files/folders")
    args = parser.parse_args()

    junk_items = find_junk()

    if not junk_items:
        print("🎉 No junk found, your project is already clean!")
    else:
        if args.dry_run:
            print(f"🔍 Found {len(junk_items)} junk items (dry-run, not deleted):")
            for item in junk_items:
                print("   🗑️", item)

        elif args.delete:
            print(f"⚠️ Deleting {len(junk_items)} junk items...")
            delete_junk(junk_items)
            print("✅ Cleanup complete!")

        else:
            print("❌ Please choose an option: --dry-run or --delete")
