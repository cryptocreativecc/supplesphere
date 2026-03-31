import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");

async function main() {
  await pb.collection("_superusers").authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  );
  console.log("✅ Authenticated\n");

  // Seed categories
  const categories = [
    { name: "Protein", slug: "protein", icon: "💪", description: "Whey, casein, plant-based protein powders and supplements" },
    { name: "Creatine", slug: "creatine", icon: "⚡", description: "Creatine monohydrate and other creatine forms" },
    { name: "Pre-Workout", slug: "pre-workout", icon: "🔥", description: "Pre-workout formulas and energy supplements" },
    { name: "Vitamins & Minerals", slug: "vitamins-minerals", icon: "💊", description: "Multivitamins, individual vitamins, and mineral supplements" },
    { name: "Amino Acids", slug: "amino-acids", icon: "🧬", description: "BCAAs, EAAs, and individual amino acid supplements" },
    { name: "Fat Burners", slug: "fat-burners", icon: "🔥", description: "Thermogenics, fat burners, and weight management supplements" },
    { name: "Omega & Fish Oil", slug: "omega-fish-oil", icon: "🐟", description: "Omega-3, fish oil, and essential fatty acid supplements" },
    { name: "Testosterone Boosters", slug: "testosterone-boosters", icon: "📈", description: "Natural testosterone support supplements" },
    { name: "Nootropics", slug: "nootropics", icon: "🧠", description: "Cognitive enhancers and brain health supplements" },
    { name: "Recovery", slug: "recovery", icon: "🩹", description: "Post-workout recovery, joint support, and sleep aids" },
    { name: "Mass Gainers", slug: "mass-gainers", icon: "🏋️", description: "High-calorie mass gainer shakes and supplements" },
    { name: "Greens & Superfoods", slug: "greens-superfoods", icon: "🥬", description: "Green powders, superfood blends, and whole food supplements" },
  ];

  console.log("📦 Seeding categories...");
  for (const cat of categories) {
    try {
      await pb.collection("categories").create(cat);
      console.log(`  ✅ ${cat.name}`);
    } catch (e: any) {
      if (e?.status === 400) console.log(`  ⏭️  ${cat.name} (exists)`);
      else throw e;
    }
  }

  // Seed default communities
  const communities = [
    { slug: "sourcereviews", name: "Source Reviews", description: "Reviews of supplement sellers, retailers, and online stores. Share your experiences with ordering, delivery, customer service, and product authenticity.", post_types: JSON.stringify(["source_review"]), member_count: 0, rules: JSON.stringify(["Include star rating","Minimum 50 words","One review per source per week","No promotional content"]) },
    { slug: "supplementreviews", name: "Supplement Reviews", description: "In-depth reviews of individual supplement products. Share your experience with specific products including effectiveness, taste, mixability, and value for money.", post_types: JSON.stringify(["product_review"]), member_count: 0, rules: JSON.stringify(["Include star rating","Minimum 50 words","Mention brand and product name","Include dosage and duration of use"]) },
    { slug: "sourcetalk", name: "Source Talk", description: "General discussion about supplements, sources, deals, and the industry. Ask questions, share tips, discuss news, and connect with fellow supplement enthusiasts.", post_types: JSON.stringify(["discussion","deal","image_post"]), member_count: 0, rules: JSON.stringify(["Stay on topic","Be respectful","No sourcing illegal substances","No medical advice"]) },
  ];

  console.log("\n🏟️ Seeding communities...");
  for (const comm of communities) {
    try {
      await pb.collection("communities").create(comm);
      console.log(`  ✅ a/${comm.slug}`);
    } catch (e: any) {
      if (e?.status === 400) console.log(`  ⏭️  a/${comm.slug} (exists)`);
      else throw e;
    }
  }

  console.log("\n🎉 Seed data complete!");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
