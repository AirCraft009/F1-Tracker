// Source - https://stackoverflow.com/a/71843281
// Posted by Karim Fayed, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-27, License - CC BY-SA 4.0

export function checkObjectsForUndefined(myObject:object | undefined):boolean
{

    if(myObject === undefined)
        return true;

    let result = false;

    let nestedObjectFlag = false;

    let attributes = Object.values(myObject);

    for(let i = 0;i<attributes.length;i++)
    {
        if(attributes[i] instanceof Object)
        {
            nestedObjectFlag = true;

            result = result || checkObjectsForUndefined(attributes[i])
        }

        else
        {
            if(!attributes[i])
                result = true;
        }
    }

    if(nestedObjectFlag)
        return result;
    else
        return Object.values(myObject).some((value) => !value)
}
