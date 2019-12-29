git fetch --all
touch tmp
git add .
git commit -m "work"
git log -n 2
git rebase origin/master
git reset --soft HEAD^
git log -n 2
rm tmp
git add .
