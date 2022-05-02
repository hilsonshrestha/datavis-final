var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/hilsonshrestha/datavis-final.git', // Update to point to your repository  
        user: {
            name: 'Hilson Shrestha', // update to use your name
            email: 'hilsonshrestha@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)