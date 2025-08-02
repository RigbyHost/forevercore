// sync.d.ts
declare function syncAccount(gdpsid: string, userNameStr: string, accountIDStr: string | number, passwordStr: string, gjp2Str: string, req): Promise<string>;
export = syncAccount;