fetch("../data/navbar.json")
    .then(rs=>rs.json()
    .then(navbaritems => {
        const navbar = [];
        for (item of navbaritems) {
            if (item?.path !== window.location.pathname) {
                navbar.push(
                    `<a href="${item.url}">${item.title}</a>`
                );
            }
        }
        // console.table(navbar);
        document.getElementById("navbar").innerHTML = navbar.join(" • ");
}));
