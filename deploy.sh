echo "Pushing to Bitbucket"
git -c diff.mnemonicprefix=false -c core.quotepath=false push -v --tags bitbucket master:master
echo "Pushing to Github"
git -c diff.mnemonicprefix=false -c core.quotepath=false push -v --tags origin master:master