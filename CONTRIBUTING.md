Thank you for contributing to BloomingLeaf. Your contribution helps to make this a fantastic tool. This is a living document. If there is an issue or something requires clarification, please create a change request as discussed below.

# Contribution Change Requests for Bug Fixes and New Features
Anyone with a gitHub account can contribute a bug/feature request to our project by entering it in our [issues page](https://github.com/amgrubb/BloomingLeaf/issues).

# Contribution Code Changes
The following explains how to contribute to BloomingLeaf. 

## Project Setup
1. Clone / Download a local copy of the [repository](https://github.com/amgrubb/BloomingLeaf).
2. You also need a copy of [Rappid](https://www.jointjs.com/), which we use as the basis for our tool. We are currently using Rappid Academic Version 1.7.0 in the [live](http://www.cs.utoronto.ca/~amgrubb/leaf-blooming-ui) version of our tool.

## Committing Changes
Before working on an update, make sure their is an appropriate entry on the [issues page](https://github.com/amgrubb/BloomingLeaf/issues) and assign yourself to this issue.

Generally, we follow [this diagram](http://nvie.com/files/Git-branching-model.pdf) for our workflow model, but we exclusively use pull requests to commit to both `develop` and `master`.

The following excerpts are adapted from [Vincent Driessen](http://nvie.com/posts/a-successful-git-branching-model/), and we want to give full credit for their contribution.

### The main branches. 
The central repo holds two main branches with an infinite lifetime: `master` and `develop`.

We consider origin/master to be the main branch where the source code of HEAD always reflects a production-ready state.

We consider origin/develop to be the main branch where the source code of HEAD always reflects a state with the latest delivered development changes for the next release. Some would call this the “integration branch”. 

**All new contributions should be submitted to the `develop` branch via a pull request from a feature branch.**

### Feature branches.
Feature branches (or sometimes called topic branches) are used to develop new features for the upcoming or a distant future release. When starting development of a feature, the target release in which this feature will be incorporated may well be unknown at that point. The essence of a feature branch is that it exists as long as the feature is in development, but will eventually be merged back into `develop` (to definitely add the new feature to the upcoming release) or discarded (in case of a disappointing experiment).

May branch off from: `develop`
Must merge back into via a pull request: `develop`
Branch naming convention: anything except master, develop, release-*, or hotfix-*

## Detailed instructions for those new to git.
Again before working on an update, make sure their is an appropriate entry on the [issues page](https://github.com/amgrubb/BloomingLeaf/issues) and assign yourself to this issue.

### Create a new feature branch.
When starting work on a new feature, branch off from the develop branch and give your feature branch a descriptive name.
`git checkout -b feature-myfeature develop`

### Make the appropriate code updates and commit local changes.
Check the status of your changes.
`git status`

#### (a) Commit all modified existing files.
`git commit -am “your commit message”`

#### (b) Commit selected files or add new ones.
`git add <file name>`
`git commit -m "your commit message"`

### Pushing your feature branch to origin.
`git push origin HEAD`

### Create a pull request.
Go to the [BloomingLeaf gitHub website](https://github.com/amgrubb/BloomingLeaf) and create a new pull request for your feature.
`base: develop`
`compare: feature-myfeature`
Include links to the issue you were working on.

Note: After you have created a pull request you should not continue committing to your feature branch, because if you perform another push to origin (`git push origin HEAD`) on your feature branch then the new commits will be added to the previous pull request.

### Update local develop.
After pull requests are approved you will need to update your local copy of `develop`.
`git pull origin develop`

You may also need to merge it into other ongoing feature branches.
`git checkout feature-otherWork`
`git merge —no-ff develop`

After your pull request has been approved you can delete your local copy of feature-myfeature. Project admins will delete the origin version of feature-myfeature upon approving the corresponding pull request.
`git branch -d feature-myfeature`

Thanks again for your contributions to BloomingLeaf.
