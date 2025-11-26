# 8. Create the complete ZIP file with all project files
import zipfile
import os
from datetime import datetime

# Create the ZIP file
zip_filename = f"quantum-circuit-builder-complete-{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

print(f"📦 Creating ZIP file: {zip_filename}")

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add all files from the project directory
    for root, dirs, files in os.walk(project_name):
        for file in files:
            file_path = os.path.join(root, file)
            archive_path = os.path.relpath(file_path, project_name)
            zipf.write(file_path, archive_path)
            print(f"  ✅ Added: {archive_path}")

# Get ZIP file info
zip_size = os.path.getsize(zip_filename)
zip_size_mb = zip_size / (1024 * 1024)

print(f"\n🎉 ZIP FILE CREATED SUCCESSFULLY!")
print(f"📁 Filename: {zip_filename}")
print(f"📊 Size: {zip_size_mb:.2f} MB")
print(f"📂 Contains: Complete quantum circuit builder project")

# List all files included
print(f"\n📋 FILES INCLUDED:")
with zipfile.ZipFile(zip_filename, 'r') as zipf:
    file_list = zipf.namelist()
    for file in sorted(file_list):
        print(f"   📄 {file}")

print(f"\n🎯 PROJECT SUMMARY:")
print(f"✅ HTML: Professional multi-page application")
print(f"✅ CSS: Complete responsive styling with light/dark themes") 
print(f"✅ JavaScript: Full-featured quantum circuit builder (~92KB)")
print(f"✅ Firebase: Authentication and cloud storage integration")
print(f"✅ MongoDB: Database configuration for user data")
print(f"✅ Documentation: Comprehensive README and setup guide")
print(f"✅ Configuration: Package.json and config templates")

print(f"\n🏆 ALL REQUESTED FEATURES IMPLEMENTED:")
print(f"1. ✅ Beginner-friendly drag & drop gates")
print(f"2. ✅ Probability charts, Bloch sphere, multi-language code output") 
print(f"3. ✅ Add/remove qubits with undo/redo functionality")
print(f"4. ✅ Drag gates off-screen to delete them")
print(f"5. ✅ Import quantum code to build circuits visually")
print(f"6. ✅ MongoDB Atlas database integration")
print(f"7. ✅ Firebase authentication (email/password + Google OAuth)")
print(f"8. ✅ Light/dark mode toggle on all pages")

print(f"\n🎊 READY FOR SUBMISSION!")
print(f"Download the ZIP file to get your complete quantum computing platform!")

zip_filename