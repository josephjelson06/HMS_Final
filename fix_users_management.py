import os

file_path = r"c:\Users\josep\Desktop\HMS_Final\FrontEnd\presentation\pages\super\UsersManagement.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Fix handleToggleRoleStatus
    if "onClick: () => handleToggleRoleStatus(role.name)" in line:
        line = line.replace(
            "handleToggleRoleStatus(role.name)",
            "handleToggleRoleStatus((role as any).id || role.name)",
        )

    # Fix handleRemoveRole
    if "onClick: () => handleRemoveRole(role.name)" in line:
        line = line.replace(
            "handleRemoveRole(role.name)",
            "handleRemoveRole((role as any).id || role.name, role.name)",
        )

    # Fix RoleDetailView props assignment
    if "onBack={() => setActiveTab('ROLES')}" in line:
        line = line.replace(
            "onBack={() => setActiveTab('ROLES')}",
            "onBack={() => { setSelectedRoleForView(null); setActiveTab('ROLES'); }}",
        )

    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fix applied successfully.")
