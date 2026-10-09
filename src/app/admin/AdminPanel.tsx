"use client";
import { useEffect, useState } from "react";
import type { ManagedWork } from "@/lib/cms/types";
type Enquiry = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  services: string[];
  status: string;
  createdAt: string;
};
async function api(path: string, options?: RequestInit) {
  const r = await fetch("/api/admin/" + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.message || "Request failed.");
  return data;
}
export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false),
    [checking, setChecking] = useState(true),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [works, setWorks] = useState<ManagedWork[]>([]),
    [version, setVersion] = useState(0),
    [selected, setSelected] = useState(0),
    [tab, setTab] = useState("works"),
    [enquiries, setEnquiries] = useState<Enquiry[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false);
  async function load() {
    const data = await api("works");
    setWorks(data.projects);
    setVersion(data.version);
    setDirty(false);
  }
  useEffect(() => {
    api("session")
      .then(() => {
        setAuthenticated(true);
        return load();
      })
      .catch((e) => {
        if (e.message !== "Sign in with your admin account.")
          setMessage(e.message);
      })
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    const prevent = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not complete request.",
      );
    } finally {
      setBusy(false);
    }
  }
  function update(patch: Partial<ManagedWork>) {
    setWorks((prev) =>
      prev.map((p, i) =>
        i === selected
          ? { ...p, ...patch }
          : patch.featured && p.featured === patch.featured
            ? { ...p, featured: 0 }
            : p,
      ),
    );
    setDirty(true);
  }
  async function upload(file: File, field: "image" | "video") {
    await action(async () => {
      if (!file.type.startsWith(field === "image" ? "image/" : "video/"))
        throw Error("Choose a matching image or video file.");
      if (file.size > 100 * 1024 * 1024)
        throw Error("Choose a file under 100 MB.");
      const signed = await api("upload-signature", { method: "POST" });
      const form = new FormData();
      form.set("file", file);
      for (const key of ["apiKey", "timestamp", "folder", "signature"])
        form.set(key === "apiKey" ? "api_key" : key, String(signed[key]));
      const r = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/${field}/upload`,
        { method: "POST", body: form },
      );
      const result = await r.json();
      if (!r.ok) throw Error(result.error?.message || "Upload failed.");
      update({ [field]: result.secure_url });
      setMessage("Uploaded. Save changes to publish this media.");
    });
  }
  const project = works[selected];
  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500";
  const button =
    "min-h-11 rounded-xl bg-[#1677FF] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50";
  if (checking)
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        Loading control panel…
      </main>
    );
  if (!authenticated)
    return (
      <main className="grid min-h-screen place-items-center bg-[#05070B] px-5 text-white">
        <form
          className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 p-8"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              await api("session", {
                method: "POST",
                body: JSON.stringify({ email, password }),
              });
              setPassword("");
              setAuthenticated(true);
              await load();
            });
          }}
        >
          <p className="text-sm text-blue-400">NORTHFRAME / CONTROL PANEL</p>
          <h1 className="text-3xl font-semibold">Welcome back.</h1>
          <label className="block">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              className={input + " mt-2"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              className={input + " mt-2"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy} className={button}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p role="status" className="text-sm text-blue-200">
            {message}
          </p>
        </form>
      </main>
    );
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white p-5 sm:px-10">
        <div>
          <p className="text-xs font-bold tracking-widest text-blue-600">
            NORTHFRAME
          </p>
          <h1 className="text-xl font-semibold">Control panel</h1>
        </div>
        <div className="flex gap-4">
          <a href="/" target="_blank" rel="noreferrer" className="py-3 text-sm">
            View website ↗
          </a>
          <button
            disabled={busy}
            onClick={() => {
              if (dirty && !confirm("Discard unsaved changes and sign out?"))
                return;
              action(async () => {
                await api("session", { method: "DELETE" });
                setAuthenticated(false);
                setDirty(false);
              });
            }}
            className="text-sm"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-5 sm:p-10">
        <nav className="mb-6 flex gap-3">
          <button
            className={tab === "works" ? button : "px-5 py-3"}
            onClick={() => setTab("works")}
          >
            Works
          </button>
          <button
            disabled={busy}
            className={tab === "enquiries" ? button : "px-5 py-3"}
            onClick={() =>
              action(async () => {
                setEnquiries(await api("enquiries"));
                setTab("enquiries");
              })
            }
          >
            Enquiries
          </button>
        </nav>
        <p aria-live="polite" className="mb-4 text-sm text-blue-700">
          {busy ? "Working…" : message}
        </p>
        {tab === "works" ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Your portfolio</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {works.length} works · Choose three featured works ·{" "}
                  {dirty ? "Unsaved changes" : "Up to date"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  className="rounded-xl border px-4 py-3 text-sm"
                  onClick={() => {
                    setWorks([
                      ...works,
                      {
                        slug: "new-work-" + Date.now(),
                        title: "New work",
                        category: "",
                        description: "",
                        image: "",
                        imageAlt: "",
                        video: "",
                        published: false,
                        featured: 0,
                      },
                    ]);
                    setSelected(works.length);
                    setDirty(true);
                  }}
                >
                  + Add work
                </button>
                <button
                  disabled={busy || !dirty}
                  className={button}
                  onClick={() =>
                    action(async () => {
                      const r = await api("works", {
                        method: "PUT",
                        body: JSON.stringify({ projects: works, version }),
                      });
                      setVersion(r.version);
                      setDirty(false);
                      setMessage(
                        "Saved. Published works are now visible on your website.",
                      );
                    })
                  }
                >
                  Save changes
                </button>
              </div>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="space-y-2 rounded-2xl border bg-white p-3">
                {works.map((w, i) => (
                  <button
                    disabled={busy}
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`block w-full rounded-xl p-4 text-left ${selected === i ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
                  >
                    <span className="block font-semibold">{w.title}</span>
                    <span className="text-xs">
                      {w.published ? "Published" : "Draft"}
                      {w.featured ? ` · Featured ${w.featured}` : ""}
                    </span>
                  </button>
                ))}
              </aside>
              {project && (
                <section className="space-y-5 rounded-2xl border bg-white p-5 sm:p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Edit work</h3>
                    <button
                      disabled={busy}
                      className="text-sm text-red-600"
                      onClick={() => {
                        if (
                          confirm(
                            "Remove this work? It will be deleted when you save.",
                          )
                        ) {
                          setWorks(works.filter((_, i) => i !== selected));
                          setSelected(0);
                          setDirty(true);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <fieldset disabled={busy} className="space-y-5">
                    {(["title", "slug", "category", "imageAlt"] as const).map(
                      (field) => (
                        <label
                          key={field}
                          className="block text-sm font-medium"
                        >
                          {
                            {
                              title: "Title",
                              slug: "URL slug",
                              category: "Category",
                              imageAlt: "Image description",
                            }[field]
                          }
                          <input
                            className={input + " mt-2"}
                            value={project[field]}
                            onChange={(e) =>
                              update({ [field]: e.target.value })
                            }
                          />
                        </label>
                      ),
                    )}
                    <label className="block text-sm font-medium">
                      Project description
                      <textarea
                        rows={5}
                        className={input + " mt-2"}
                        value={project.description}
                        onChange={(e) =>
                          update({ description: e.target.value })
                        }
                      />
                    </label>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="text-sm">
                        Visibility
                        <select
                          className={input + " mt-2"}
                          value={String(project.published)}
                          onChange={(e) =>
                            update({
                              published: e.target.value === "true",
                              ...(e.target.value === "false"
                                ? { featured: 0 }
                                : {}),
                            })
                          }
                        >
                          <option value="true">Published</option>
                          <option value="false">Draft</option>
                        </select>
                      </label>
                      <label className="text-sm">
                        Homepage feature
                        <select
                          className={input + " mt-2"}
                          value={project.featured}
                          disabled={!project.published}
                          onChange={(e) =>
                            update({ featured: Number(e.target.value) })
                          }
                        >
                          <option value={0}>Not featured</option>
                          {[1, 2, 3].map((slot) => (
                            <option key={slot} value={slot}>
                              Featured {slot}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {(["image", "video"] as const).map((field) => (
                      <div key={field} className="rounded-xl border p-4">
                        <label className="block text-sm font-medium">
                          {field === "image"
                            ? "Cover image / video poster"
                            : "Project video (optional)"}
                          <input
                            className={input + " my-2"}
                            value={project[field]}
                            onChange={(e) =>
                              update({ [field]: e.target.value })
                            }
                            placeholder="Cloudinary URL"
                          />
                        </label>
                        <input
                          type="file"
                          aria-label={`Upload ${field}`}
                          accept={field === "image" ? "image/*" : "video/*"}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) upload(f, field);
                            e.target.value = "";
                          }}
                        />
                        {field === "image" && project.image && (
                          <img
                            src={project.image}
                            alt={project.imageAlt}
                            className="mt-4 aspect-video w-full rounded-lg object-cover"
                          />
                        )}
                        {field === "video" && project.video && (
                          <video
                            src={project.video}
                            poster={project.image}
                            controls
                            playsInline
                            className="mt-4 w-full rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </fieldset>
                </section>
              )}
            </div>
          </>
        ) : (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Recent enquiries</h2>
            {!enquiries.length && (
              <p className="rounded-xl bg-white p-6">No enquiries yet.</p>
            )}
            {enquiries.map((q) => (
              <article key={q._id} className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{q.name}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <select
                    aria-label={`Status for ${q.name}`}
                    disabled={busy}
                    className="rounded-lg border px-3"
                    value={q.status}
                    onChange={(e) =>
                      action(async () => {
                        await api("enquiries", {
                          method: "PATCH",
                          body: JSON.stringify({
                            id: q._id,
                            status: e.target.value,
                          }),
                        });
                        setEnquiries(await api("enquiries"));
                      })
                    }
                  >
                    {["new", "contacted", "closed"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <p className="my-3 text-sm">{q.services.join(", ")}</p>
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                  {q.projectDetails}
                </p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-blue-600">
                  <a href={`tel:${q.phone}`}>{q.phone}</a>
                  {q.email && <a href={`mailto:${q.email}`}>{q.email}</a>}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
