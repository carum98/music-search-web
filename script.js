const search = document.querySelector("#search");
const song = document.querySelector("#song");
const loading = document.querySelector("#loading");
const results = document.querySelector("#results");

const apiUrl = "http://localhost:3000";

const debounce = (func, timeout = 1200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const fetchSearch = async () => {
  loading.classList.add("active");

  const value = document.querySelector("#search input").value;

  const response = await fetch(`${apiUrl}/search?q=${value}`);
  const { genius, spotify } = await response.json();

  suggestions(genius);

  loading.classList.remove("active");
};

const fetchSong = async (song_url, lyrics_url) => {
  loading.classList.add("active");

  const response = await fetch(`${apiUrl}${song_url}`);
  const data = await response.json();

  songInformation(data);

  const response2 = await fetch(`${apiUrl}${lyrics_url}`);
  const data2 = await response2.json();

  lyrics(data2);

  loading.classList.remove("active");
};

const suggestions = (data) => {
  const fragment = document.createDocumentFragment();

  results.innerHTML = "";

  data.forEach(({ artist, title, song_url, lyrics_url }) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const section = document.createElement("section");

    const p = document.createElement("p");
    const p2 = document.createElement("p");

    p.innerHTML = title;
    p2.innerHTML = artist.name;

    section.append(p, p2);

    img.src = artist.image_url;

    li.append(img, section);
    li.classList.add("search-result");

    li.addEventListener("click", () => {
      fetchSong(song_url, lyrics_url);

      results.classList.add("hide");
      song.innerHTML = "";
    });

    fragment.appendChild(li);
  });

  results.appendChild(fragment);
};

const songInformation = ({ artist, title, thumbnail_url }) => {
  const section = document.createElement("section");
  section.id = "song-info";

  const img = document.createElement("img");
  img.src = thumbnail_url;

  const h2 = document.createElement("h2");
  h2.innerHTML = title;

  const p = document.createElement("p");
  p.innerHTML = artist.name;

  section.append(img, h2, p);

  song.append(section);
};

const lyrics = (data) => {
  const fragment = document.createDocumentFragment();

  const section = document.createElement("section");
  section.id = "lyrics";

  for (const key in data) {
    const div = document.createElement("div");
    div.classList.add(`lyric-${key}`);

    const { lyric, source } = data[key];

    const p = document.createElement("p");
    p.innerHTML = lyric || "No lyrics found";

    const a = document.createElement("a");
    a.href = source;
    a.setAttribute("target", "_blank");
    a.innerHTML = `Source: ${key}`;

    div.append(p, a);

    fragment.appendChild(div);
  }

  section.append(fragment);
  song.append(section);
};

search.addEventListener("keyup", debounce(fetchSearch));

document.addEventListener("click", ({ target: { parentNode = {} } }) => {
  const results = document.querySelector("#results");

  if (results.hasChildNodes()) results.classList.add("hide");
  if (parentNode.id === "search") results.classList.remove("hide");
});
