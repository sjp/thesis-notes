var callR = function(args) {
    var hasData = !! args.data;
    var hasProcessData = !! args.processData;
    var hasDataType = !! args.dataType;
    var hasContext = !! args.context;
    var hasType = !! args.type;
    if (hasData && hasProcessData) {
        args.data = JSON.stringify(args.data);
    }
    if (! hasDataType) {
        args.dataType = "text";
    }
    if (! hasContext) {
        args.context = this;
    }
    if (! hasType) {
        if (hasData) {
            args.type = "POST";
        } else {
            args.type = "GET";
        }
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === xhr.DONE) {
            var resp;
            switch (args.dataType) {
                case "json":
                    resp = JSON.parse(xhr.responseText);
                    break;
                case "xml":
                    resp = xhr.responseXML;
                    break;
                case "text":
                    resp = xhr.responseText;
                    break;
                default:
                    resp = xhr.responseText;
            }
            args.callback.call(args.context, resp);
        }
    };
    xhr.open(args.type, args.url);
    if (hasData) {
        xhr.send(args.data);
    } else {
        xhr.send();
    }
};
