// /*[traceur-runtime]*/
this._System=...
/*[production-config]*/
steal={env: 'production'};

/*[system-bundles-config]*/
System.paths["bundles/*.css"] ="dist1/bundles/*css";
System.paths["bundles/*"] = "dist1/bundles/*.js";
System.bundles = ['bundle0']
alert('Main Bundle')