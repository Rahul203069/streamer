import { prisma } from "@/lib/prisma";

export type LiveStreamFeedItem = {
  id: string;
  title: string;
  cloudflareLiveInputId: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export async function getLiveStreamFeed(): Promise<LiveStreamFeedItem[]> {
  const liveStreams = await prisma.liveStream.findMany({
    where: {
      status: {
        notIn: ["disabled", "ended"],
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return liveStreams.map((stream) => ({
    id: stream.id,
    title: stream.title,
    cloudflareLiveInputId: stream.cloudflareLiveInputId,
    status: stream.status,
    createdAt: stream.createdAt.toISOString(),
    user: stream.user,
  }));
}
