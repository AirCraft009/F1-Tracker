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