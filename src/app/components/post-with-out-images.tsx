import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Post {
  id: number;
  title: { rendered: string };
  link: string;
  image?: string;
  featured_media: number;
}

type PostWithOutImagesProps = {
  wp: string;
  in: string;
};

const PostWithOutImages: React.FC<PostWithOutImagesProps> = (props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>(""); // State for category ID
  const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryParam = categoryId ? `&categories=${categoryId}` : "";
        const BASE_URL = `https://${props.wp}/wp-json/wp/v2/posts?per_page=30${categoryParam}`;
        const response = await axios.get<Post[]>(BASE_URL);
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      }
    };
    fetchData();
  }, [categoryId]); // Re-fetch when categoryId changes

  const postData = (post: Post) => {
    const { title, link, image } = post;
    const requestBody = {
      content: {
        contentEntities: [
          {
            entityLocation: `${link}`,
            thumbnails: [{ resolvedUrl: image }],
          },
        ],
        title: `${title.rendered}`,
      },
      distribution: { linkedInDistributionTarget: {} },
      owner: `urn:li:organization:${props.in}`,
      subject: "Test Share Subject",
      text: { text: `${title.rendered} \n${link}\n#Recrutement` },
    };

    axios({
      method: "post",
      url: "https://api.linkedin.com/v2/shares",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestBody),
    })
      .then((response: AxiosResponse) => {
        console.log(response.data);
        setMsg(JSON.stringify(response.data));
      })
      .catch((error: any) => {
        console.error(error);
        setMsg(error.message);
      });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div style={{ margin: "10px" }}>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="categoryId" style={{ marginRight: "10px" }}>
          Enter Category ID:
        </label>
        <input
          type="text"
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            padding: "5px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
          placeholder="Leave empty to fetch all"
        />
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Post</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={cellStyle}>{post.id}</td>
              <td style={cellStyle}>
                {post.title.rendered}
                <br />
                {post.link}
                <br />
                #Recrutement #Offre_Emploi
                <br />
                <button
                  className="bg-red-500 m-5 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleCopy(`${post.title.rendered}\n${post.link}\n#Recrutement #Offre_Emploi`)}
                >
                  Copy
                </button>
              </td>
              <td>
                <button
                  onClick={() => postData(post)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Post
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>{msg !== null ? msg : ""}</div>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: "10px",
};

export default PostWithOutImages;
