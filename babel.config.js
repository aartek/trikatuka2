//to make jest work with typescript, this buabel config must be incluced
module.exports = {
    presets: [

        '@babel/preset-env',
        '@babel/preset-typescript',
    ],
    plugins: [
        //fix for ReferenceError: regeneratorRuntime is not defined in tests
        '@babel/plugin-transform-runtime'
    ]
};
