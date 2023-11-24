// note.comの記事一覧ページから記事のURLを取得する
// 使い方: note.comの記事一覧ページを開いて、コンソールに貼り付けて実行する

// Get all elements with class "o-noteListLibrary__item" inside the element with class "o-noteListLibrary"
const items = document.querySelectorAll('.o-noteListLibrary .o-noteListLibrary__item');
const relust = [];
// Iterate over each element
items.forEach(function (item) {
    // Find the descendant anchor element
    const anchorElement = item.querySelector('a');

    // Check if the anchor element is found
    if (anchorElement) {
        // Get aria-label and href attributes from the anchor element
        const title = anchorElement.getAttribute('aria-label');
        const url = "https://note.com" + anchorElement.getAttribute('href');

        // // Output the values (you can modify this part based on your use case)
        // console.log('aria-label:', ariaLabel);
        // console.log('href:', href);
        relust.push({ title, url })
    }
});
console.log(relust)
