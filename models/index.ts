import mongoose, { Schema, Model, models, model } from "mongoose";

const opts = { timestamps: true };
const img = new Schema({ url: String, publicId: String }, { _id: false });
const str = { type: String, trim: true, default: "" };
const num = { type: Number, default: 0 };

const m = (name: string, schema: Schema): Model<any> =>
  (models[name] as Model<any>) || model(name, schema);

// চলমান প্রজেক্ট
const Project = m(
  "Project",
  new Schema(
    {
      title: { type: String, required: true, trim: true },
      clientName: str,
      note: str,
      deliveryDate: str,
      status: { type: String, default: "Pending" },
      delivered: { type: Boolean, default: false }, // ডিফল্ট No
      deliveryLink: str,
      tasks: [{ text: String, done: { type: Boolean, default: false } }],
    },
    opts
  )
);

// ওয়ান টাইম ক্লায়েন্ট
const Client = m(
  "Client",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      phone: str,
      workType: str,
      address: str,
      note: str,
      workDate: str,
      deliveryDate: str,
      charge: num,
      paid: num,
      status: { type: String, default: "আগ্রহী" },
      packageConverted: { type: Boolean, default: false },
      agreementImages: [img],
    },
    opts
  )
);

// প্যাকেজ টেমপ্লেট (আগে থেকে বানিয়ে রাখা)
const Pkg = m(
  "Package",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      price: num,
      duration: str,
      description: str,
      services: [String],
    },
    opts
  )
);

// প্যাকেজ ক্লায়েন্ট
const PackageClient = m(
  "PackageClient",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      phone: str,
      address: str,
      note: str,
      packageId: str,
      packageName: str,
      price: num,
      duration: str,
      services: [String],
      startDate: str,
      endDate: str,
      deliveryDates: [String],
      charge: num,
      paid: num,
      agreementImages: [img],
    },
    opts
  )
);

// সম্ভাব্য ক্লায়েন্ট
const Lead = m(
  "Lead",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      phone: str,
      interest: str,
      note: str,
      date: str,
    },
    opts
  )
);

export const registry: Record<string, Model<any>> = {
  projects: Project,
  clients: Client,
  packages: Pkg,
  "package-clients": PackageClient,
  leads: Lead,
};

export { mongoose };
