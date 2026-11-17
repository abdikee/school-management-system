import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usersApi } from "@/services/api";
import { UserRole } from "@/types/api";

type Permission = {
  key: string;
  description?: string;
  rolePermissions: Array<{ role: UserRole }>;
};

const roles: UserRole[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

export function AdminPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await usersApi.getPermissions();
    setPermissions(data);
    setSelected(data.filter((permission) =>
      permission.rolePermissions.some((assignment) => assignment.role === role),
    ).map((permission) => permission.key));
  };

  useEffect(() => { void load(); }, [role]);

  const permissionMap = useMemo(() => new Set(selected), [selected]);

  const save = async () => {
    setSaving(true);
    try {
      await usersApi.updatePermissions(role, selected);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">Manage database-backed role permissions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Role permissions</CardTitle>
          <div className="flex flex-wrap gap-2">
            {roles.map((item) => (
              <Button key={item} variant={role === item ? "default" : "outline"} onClick={() => setRole(item)}>
                {item}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {permissions.map((permission) => (
            <label key={permission.key} className="flex items-start gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                checked={permissionMap.has(permission.key)}
                onChange={(event) => setSelected((current) =>
                  event.target.checked
                    ? [...current, permission.key]
                    : current.filter((key) => key !== permission.key),
                )}
              />
              <span>
                <span className="block font-medium">{permission.key}</span>
                <span className="text-sm text-muted-foreground">{permission.description}</span>
              </span>
            </label>
          ))}
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving..." : "Save permissions"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
