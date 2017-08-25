
TODO finish this.
Steps for creating good issues or pull requests.
Links to external documentation, mailing lists, or a code of conduct.
Community and behavioral expectations.



##Intro for people unframiliar with gitHub.

— got to branch you want to branch off of

- creates new branch
git checkout -b feature-update-gitIgnore

— make updates

git status


1. — Commit selected files
- Staging commit
git add .gitignore
git commit -m "Updated .gitignore"

2. — Commit all modified existing files.
git commit -am “commit message”

— Pushing branch to origin
git push origin HEAD

go to website, create pull request.

checkout last branch:
git checkout -

after pull request approved
update local develop:
git pull origin develop 		or “git pull”

merge updated develop branch into other ongoing feature branches
git checkout -b feature
git merge —no-ff develop
