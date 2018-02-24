function previewFile(){
     var preview = document.querySelector('img'); //selects the query named img
     var file    = document.querySelector('input[type=file]').files[0]; //sames as here
     var reader  = new FileReader();

     reader.onloadend = function () {
         preview.src = reader.result;
     }

     if (file) {
         reader.readAsDataURL(file); //reads the data as a URL
     } else {
         preview.src = "";
     }
}

// previewFile();  //calls the function named previewFile()


// (function () {
//         var holder = document.getElementById('upload');
//         if (!holder) {
//           return false;
//         }
//
//         holder.ondragover = () => {
//             return false;
//         };
//
//         holder.ondragleave = () => {
//             return false;
//         };
//
//         holder.ondragend = () => {
//             return false;
//         };
//
//         holder.onclick = () => {
//           console.log("hello");
//         }
//
//         holder.ondrop = (e) => {
//             e.preventDefault();
//
//             for (let f of e.dataTransfer.files) {
//                 console.log('File(s) you dragged here: ', f.path)
//             }
//
//             return false;
//         };
//     })();

// $("#new-project").submit(function(evt){
//   evt.preventDefault();
//   let name = $("#name-input")[0].value;
//   let desc = $("#desc-input")[0].value;
//   let files = $("#files-input")[0].value;
//   console.log(name);
//   console.log(desc);
//   console.log(files);
// });
