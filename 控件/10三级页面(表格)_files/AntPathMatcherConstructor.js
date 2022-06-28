define('framework/utils/AntPathMatcherConstructor', ['underscore'], function (_, undefined) {
    var CONS = {
        separator: '/'
    };

    function isPattern(pattDir) {
        return /[\?\*]/.test(pattDir);
    }

    /**
     * `?` 匹配任意一个字符
     * `*` 匹配一级任意字符
     * `**` 匹配任意多级字符
     */
    return function () {
        return function (pattern) {
            var pattDirs = pattern.split(CONS.separator),
                domainStart = /^\//.test(pattern),
                compiledPattDirs = _.map(pattDirs, function (pattDir) {
                    if ("**" === pattDir) {
                        return undefined;
                    } else if (isPattern(pattDir)) {
                        var reg = new RegExp('^' + pattDir.replace(/\?/g, '.').replace(/\*/g, '.*') + '$')
                        return function (flag) {
                            return reg.test(flag);
                        }
                    } else {
                        return function (flag) {
                            return pattDir === flag;
                        }
                    }
                });

            return function (path) {
                if (/^\//.test(path) != domainStart) {
                    return false;
                }

                var pathDirs = path.split(CONS.separator),
                    pattIdxStart = 0,
                    pattIdxEnd = pattDirs.length - 1,
                    pathIdxStart = 0,
                    pathIdxEnd = pathDirs.length - 1,
                    pattDir, i, j, patLength, strLength, foundIdx, subPat, subStr;

                // Match all elements up to the first **
                while (pattIdxStart <= pattIdxEnd && pathIdxStart <= pathIdxEnd) {
                    pattDir = pattDirs[pattIdxStart];
                    if ("**" === pattDir) {
                        break;
                    }
                    if (!compiledPattDirs[pattIdxStart](pathDirs[pathIdxStart])) {
                        return false;
                    }
                    pattIdxStart++;
                    pathIdxStart++;
                }

                if (pathIdxStart > pathIdxEnd) {
                    // Path is exhausted, only match if rest of pattern is * or **'s
                    if (pattIdxStart > pattIdxEnd) {
                        return (/\/$/.test(pattern) ? /\/$/.test(path) : !/\/$/.test(path));
                    }
                    if (pattIdxStart === pattIdxEnd && pattDirs[pattIdxStart] === "*" && /\/$/.test(path)) {
                        return true;
                    }
                    for (i = pattIdxStart; i <= pattIdxEnd; i++) {
                        if (pattDirs[i] !== "**") {
                            return false;
                        }
                    }
                    return true;
                }
                else if (pattIdxStart > pattIdxEnd) {
                    // String not exhausted, but pattern is. Failure.
                    return false;
                }
                else if ("**" === pattDirs[pattIdxStart]) {
                    // Path start definitely matches due to "**" part in pattern.
                    return true;
                }

                // up to last '**'
                while (pattIdxStart <= pattIdxEnd && pathIdxStart <= pathIdxEnd) {
                    pattDir = pattDirs[pattIdxEnd];
                    if (pattDir === "**") {
                        break;
                    }
                    if (!compiledPattDirs[pattIdxEnd](pathDirs[pathIdxEnd])) {
                        return false;
                    }
                    pattIdxEnd--;
                    pathIdxEnd--;
                }
                if (pathIdxStart > pathIdxEnd) {
                    // String is exhausted
                    for (i = pattIdxStart; i <= pattIdxEnd; i++) {
                        if (pattDirs[i] !== "**") {
                            return false;
                        }
                    }
                    return true;
                }

                while (pattIdxStart != pattIdxEnd && pathIdxStart <= pathIdxEnd) {
                    var patIdxTmp = -1;
                    for (i = pattIdxStart + 1; i <= pattIdxEnd; i++) {
                        if (pattDirs[i] === "**") {
                            patIdxTmp = i;
                            break;
                        }
                    }
                    if (patIdxTmp === (pattIdxStart + 1)) {
                        // '**/**' situation, so skip one
                        pattIdxStart++;
                        continue;
                    }
                    // Find the pattern between padIdxStart & padIdxTmp in str between
                    // strIdxStart & strIdxEnd
                    patLength = (patIdxTmp - pattIdxStart - 1);
                    strLength = (pathIdxEnd - pathIdxStart + 1);
                    foundIdx = -1;

                    strLoop:
                        for (i = 0; i <= strLength - patLength; i++) {
                            for (j = 0; j < patLength; j++) {
                                subPat = pattDirs[pattIdxStart + j + 1];
                                subStr = pathDirs[pathIdxStart + i + j];
                                if (!compiledPattDirs[pattIdxStart + j + 1](subStr)) {
                                    continue strLoop;
                                }
                            }
                            foundIdx = pathIdxStart + i;
                            break;
                        }

                    if (foundIdx === -1) {
                        return false;
                    }

                    pattIdxStart = patIdxTmp;
                    pathIdxStart = foundIdx + patLength;
                }

                for (i = pattIdxStart; i <= pattIdxEnd; i++) {
                    if (pattDirs[i] !== "**") {
                        return false;
                    }
                }

                return true;
            }
        };
    };
});