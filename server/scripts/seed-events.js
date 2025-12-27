require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function seedEvents() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('hcm_church');
    const eventsCollection = db.collection('events');
    
    // Check if events already exist
    const existingEvents = await eventsCollection.find({
      title: { $in: [
        'HCM Holy Ghost Conference',
        'HCM Thanksgiving',
        'HCM Carol Service'
      ]}
    }).toArray();
    
    if (existingEvents.length > 0) {
      console.log('Events already exist. Skipping seed.');
      return;
    }
    
    // Get current date and calculate future dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const twoMonths = new Date(today);
    twoMonths.setMonth(today.getMonth() + 2);
    
    const threeMonths = new Date(today);
    threeMonths.setMonth(today.getMonth() + 3);

    const events = [
      {
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly Sunday worship service. Experience powerful praise and worship, inspiring messages, and fellowship with our church family.',
        date: nextWeek,
        location: 'HCM Main Auditorium',
        image: '/images/events/worship-service.jpg',
        createdAt: new Date()
      },
      {
        title: 'Youth Conference 2025',
        description: 'An exciting conference designed for young people to grow in their faith, connect with peers, and discover their purpose in Christ. Special guest speakers and worship sessions.',
        date: nextMonth,
        location: 'HCM Main Auditorium',
        image: '/images/events/youth-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'Prayer & Fasting Week',
        description: 'A week of dedicated prayer and fasting. Join us as we seek God\'s face together, intercede for our community, and experience spiritual breakthrough.',
        date: twoMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/prayer-fasting.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Holy Ghost Conference',
        description: 'Join us for a powerful time of worship, prayer, and the move of the Holy Spirit. Experience God\'s presence in a fresh and transformative way.',
        date: threeMonths,
        location: 'HCM Main Auditorium',
        image: '/images/events/holy-ghost-conference.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Thanksgiving',
        description: 'A special service to give thanks to God for His faithfulness throughout the year. Come celebrate with us as we express our gratitude.',
        date: new Date(nextMonth.getFullYear(), 11, 20), // December 20th
        location: 'HCM Main Auditorium',
        image: '/images/events/thanksgiving.jpg',
        createdAt: new Date()
      },
      {
        title: 'HCM Carol Service',
        description: 'Celebrate the birth of our Savior with beautiful carols, special music, and the true meaning of Christmas. A joyous event for the whole family.',
        date: new Date(nextMonth.getFullYear(), 11, 23), // December 23rd
        location: 'HCM Main Auditorium',
        image: '/images/events/carol-service.jpg',
        createdAt: new Date()
      }
    ];
    
    const result = await eventsCollection.insertMany(events);
    console.log(`Successfully inserted ${result.insertedCount} events:`);
    events.forEach((event, index) => {
      console.log(`- ${event.title} on ${event.date.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedEvents();


