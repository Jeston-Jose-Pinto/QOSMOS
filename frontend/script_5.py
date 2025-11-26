# 6. Combine all JavaScript parts into one complete app.js file
print("🔗 Combining JavaScript files...")

with open(f"{project_name}/app_part1.js", "r") as f:
    part1 = f.read()

with open(f"{project_name}/app_part2.js", "r") as f:
    part2 = f.read()

with open(f"{project_name}/app_part3.js", "r") as f:
    part3 = f.read()

# Combine all parts
complete_app_js = part1 + part2 + part3

# Save complete app.js
with open(f"{project_name}/app.js", "w") as f:
    f.write(complete_app_js)

# Remove temporary part files
import os
os.remove(f"{project_name}/app_part1.js")
os.remove(f"{project_name}/app_part2.js") 
os.remove(f"{project_name}/app_part3.js")

print(f"✅ Created complete {project_name}/app.js ({len(complete_app_js)} characters)")