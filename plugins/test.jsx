module.exports = (app) => {
    app.get('/plugin1', (req, res) => {
        res.send('This is plugin1 route!');
    });
};