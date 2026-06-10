/**
 * Concat multiple paths while checking for path endings and normalizing the separator chars to /
 */
export function concatPaths(...paths: string[]): string{
    let path = ""

    for (let i = 0; i < paths.length; i++){
        //replace double and single backslash
        let p1 = paths[i];
        p1 = p1.replace("\\\\", "/").replace("\\", "/");

        p1 += (!p1.endsWith('/'))? "/" : "";
        if(p1.startsWith('/'))
            p1 = p1.substring(1);

        path += p1;

    }

    return path;
}

/**
 * takes a base web path and adds the given queries
 * @param basePath the web path
 * @param queries a query in format name=value
 */
export function addQueries(basePath: string, ...queries: string[]){
    if(basePath.endsWith("?")){
        basePath = basePath.replace("?", "");
    }
    if(!basePath.endsWith("/")){
        basePath += "/";
    }

    basePath += "?";
    basePath += queries.join("&");

    return basePath;
}