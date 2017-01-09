var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

var ifileUrl = argv.i;
var ofileUrl = argv.o;

//Read file use argv -i and manage errors
try{
    var ifile = fs.readFileSync(ifileUrl,'utf8');    
} catch (err) {
    console.log(err);
    process.exit();
}

//Write file in path argv -o value
try{
    fs.writeFileSync(ofileUrl,ifile);
} catch (err) {
    console.log(err);
    process.exit();
}



