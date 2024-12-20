// Copyright © 2024 Samuel Justin Speth Gabay
// Licensed under the GNU Affero Public License, Version 3

import { invokeCommand } from "./utils";

const gitBranch = invokeCommand("git", ["branch", "--show-current"])!;
const gitCommit = invokeCommand("git", ["rev-parse", "--short", "HEAD"])!;
const gitIsDirty = !!invokeCommand("git", ["status", "--short"]);

process.env.VITE__GIT_BRANCH = gitBranch;
process.env.VITE__GIT_COMMIT = gitCommit;
process.env.VITE__GIT_IS_DIRTY = String(gitIsDirty);
