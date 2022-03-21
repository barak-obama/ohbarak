
const approve = index => decide(index, 'approve', 'green');

const reject = index => decide(index, 'reject', 'red');

function decide(index, decision, color) {
    let name = document.getElementById(`name${index}`).value;
    let token = document.getElementById(`token${index}`).value;
    let nsfw = document.getElementById(`nsfw${index}`).checked;

    let ohbarak_li = document.getElementById(`ohbarak${index}`);

    ohbarak_li.style.backgroundColor = color;

    postJson(`/approve/${decision}/`, {
        name: name,
        token: token,
        nsfw: nsfw
    }, {
        withCredentials: true
    }).then((result) => {


        setTimeout(() => {

            console.log('done');

            let ohbaraks = document.getElementById('ohbaraks');
            ohbaraks.removeChild(ohbarak_li);


            if (ohbaraks.getElementsByTagName('li').length === 0){
                location.href = '/';
            }

        }, 3000);


    });
}