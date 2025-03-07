import { Connection, RowDataPacket } from 'mysql2/promise';
import db from "../../serverconf/db";
import ConsoleApi from "../../modules/console-api";

interface RoleAssign extends RowDataPacket {
  roleID: number;
}

interface Role extends RowDataPacket {
  roleName: string;
  advancedPanel: number;
  adminPanel: number;
}

interface RoleInfo {
  roleName: string;
  advancedPanel: number;
  adminPanel: number;
}

async function getRoleInfo(accountID: number): Promise<RoleInfo> {
  const [roleAssignRows] = await db.execute<RoleAssign[]>(
    'SELECT roleID FROM roleassign WHERE accountID = ?',
    [accountID]
  );
  
  if (roleAssignRows.length === 0) {
    return { roleName: "Player", advancedPanel: 0, adminPanel: 0 };
  }
  
  const roleID = roleAssignRows[0].roleID;

  const [roleRows] = await db.execute<Role[]>(
    'SELECT roleName, advancedPanel, adminPanel FROM roles WHERE roleID = ?',
    [roleID]
  );
  
  if (roleRows.length === 0) {
    return { roleName: "Player", advancedPanel: 0, adminPanel: 0 };
  }
  
  const { roleName, advancedPanel, adminPanel } = roleRows[0];
  ConsoleApi.Log("main", `Panel action: received role info. roleName: ${roleName}`);
  return { roleName, advancedPanel, adminPanel };
}

export default getRoleInfo;