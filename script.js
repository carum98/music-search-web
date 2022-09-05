const search = document.querySelector("#search");
const song = document.querySelector("#song");
const loading = document.querySelector("#loading");
const results = document.querySelector("#results");

const apiUrl = "https://music-api.carum.dev";

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
  const data = await response.json();

  suggestions(data);

  loading.classList.remove("active");
};

const fetchSong = async (song_url, lyrics_url) => {
  loading.classList.add("active");

  const response = await fetch(`${apiUrl}${song_url}`);
  const data = await response.json();

  songInformation(data);

  tabs();

  const response2 = await fetch(`${apiUrl}${lyrics_url}`);
  const data2 = await response2.json();

  lyrics(data2);

  album(data);

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

  results.classList.remove("hide");
  results.appendChild(fragment);
};

const songInformation = ({
  artist,
  title,
  thumbnail_url,
  preview_url,
  media,
}) => {
  const section = document.createElement("section");
  section.id = "song-info";

  const img = document.createElement("img");
  img.src = thumbnail_url;

  const h2 = document.createElement("h2");
  h2.innerHTML = title;

  const p = document.createElement("p");
  p.innerHTML = artist.name;

  section.append(img, h2, p);

  if (preview_url) {
    const audio = document.createElement("audio");
    audio.setAttribute("controls", "controls");
    const source = document.createElement("source");
    source.src = preview_url;
    source.type = "audio/mpeg";
    audio.append(source);

    section.append(audio);
  }

  if (media) {
    links(media);
  }

  song.append(section);
};

const lyrics = (data) => {
  const fragment = document.createDocumentFragment();

  const section = document.createElement("section");
  section.id = "lyrics";
  section.classList.add("tabContent", "active");

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

const links = (media) => {
  const section = document.createElement("section");
  section.id = "media";

  const fragment = document.createDocumentFragment();

  media.forEach(({ url, provider }) => {
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("target", "_blank");

    const img = document.createElement("img");

    if (provider === "youtube") {
      img.src = "./assets/youtube.svg";
    } else if (provider === "spotify") {
      img.src = "./assets/spotify.svg";
    } else if (provider === "soundcloud") {
      img.src = "./assets/soundcloud.svg";
    }

    a.append(img);
    fragment.appendChild(a);
  });

  section.append(fragment);

  song.append(section);
};

const album = async ({ album: { name, url } }) => {
  const section = document.createElement("section");
  section.id = "album";
  section.classList.add("tabContent");

  const h2 = document.createElement("h2");
  h2.innerHTML = name;

  section.append(h2);

  if (!url) {
    song.append(section);
    return;
  }

  const ul = document.createElement("ul");

  const response = await fetch(`${apiUrl}${url}`);
  const data = await response.json();

  data.songs.forEach(({ title, song_url, lyrics_url }) => {
    const li = document.createElement("li");
    li.classList.add("album-song");
    li.innerText = title;

    li.addEventListener("click", () => {
      fetchSong(song_url, lyrics_url);

      song.innerHTML = "";
    });

    ul.appendChild(li);
  });

  section.append(ul);

  song.append(section);
};

const clickTab = (e) => {
  const active = document.querySelector("#tabs button.active");
  active.classList.remove("active");

  e.classList.add("active");

  const tabContentActive = document.querySelector(`.tabContent.active`);
  if (tabContentActive) {
    tabContentActive.classList.remove("active");
  }

  const tabContent = document.querySelector(`#${e.id}.tabContent`);
  if (tabContent) {
    tabContent.classList.add("active");
  }
};

const tabs = () => {
  const section = document.createElement("section");
  section.id = "tabs";

  section.innerHTML = `
    <button id="lyrics" onclick="clickTab(this)" class="active">Lyrics</button>
    <button id="album" onclick="clickTab(this)">Album</button>
  `;

  song.append(section);
};

search.addEventListener("keyup", debounce(fetchSearch));

document.addEventListener("click", ({ target: { parentNode = {} } }) => {
  const results = document.querySelector("#results");

  if (results.hasChildNodes()) results.classList.add("hide");
  if (parentNode.id === "search") results.classList.remove("hide");
});
