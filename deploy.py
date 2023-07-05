import subprocess
import os
import sys

git_ls = subprocess.Popen(["git", "ls-files", "-m"], shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
files = git_ls.stdout.readlines()

for file in files:
    remote = file.decode().replace('\n', '') 
    local = remote.replace('/', '\\')
    
    subprocess.run(["mpremote", "cp", local, ":/{}".format(remote)])