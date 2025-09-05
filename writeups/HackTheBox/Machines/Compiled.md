---
name: Compiled
difficulty: Medium
author: ruycr4ft & YukaFake
dateAttempted: 10/13/24
tags:
  - linux
  - sandbox
  - gitea
flag: N/A
flagProtected: false
---

`10.10.11.26`

`nmap/initial`
```
# Nmap 7.94SVN scan initiated Sun Oct 13 22:38:35 2024 as: nmap -p- -v -Pn -o nmap/initial --min-rate=5000 10.10.11.26
Nmap scan report for 10.10.11.26
Host is up (0.18s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE
3000/tcp open  ppp
5000/tcp open  upnp
5985/tcp open  wsman
```

`nmap/8985`
```
# Nmap 7.94SVN scan initiated Sun Oct 13 22:44:17 2024 as: nmap -p5985 -A -v -Pn -o nmap/5985 --min-rate=5000 10.10.11.26
Nmap scan report for 10.10.11.26
Host is up (0.16s latency).

PORT     STATE SERVICE VERSION
5985/tcp open  http    Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

since we have an `http-title`, we can try accessing this page from the browser and see what we find.
![[Pasted image 20241014004907.png]]
Looks like there's something here.

Should've checked `3000` first. it's a git repo. let's download the `Compiled` and `Calculator` projects

`3000/ppp` isn't really PPP, it's a GiTea instance, with two projects under the `richard/` user. These are:
- `richard/Compiled`
- `richard/Calculator`

`5000/upnp` isn't really UPNP either, it's a deployment of `richard/Compiled`. Trying to figure out how to exploit this.

- Since this Compiler clones a repo and does something with it, maybe a Git Hook that triggers on clone would be useful. My default user doesn't have access to the Git Hook functionality though

Looking at the `richard/Calculator` repo `README.md` we can see that a vulnerable version of Git is being used, namely version `2.45.0`. This version is prone to exploitation via `git clone`, which is conveniently what is being done by the deployed `richard/Compiled` instance on `http://10.10.11.26:5000`.


now, we make all our repos public (`rce` + `hook`) then we post them to the `gitea.compiled.htb:3000/<user>/<repo>s` and hope for the best