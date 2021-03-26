console.log('it works');

process.on('uncaughtException', error => {
    console.error('There was an uncaught error', error);
    process.exit(1);
});
